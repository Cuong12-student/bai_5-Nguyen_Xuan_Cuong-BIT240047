import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCourses,
  updateCategory,
} from "../api/apiService";

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface Course {
  id: string;
  categoryId: string;
}

export default function CategoryScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // State cho Modal Thêm / Sửa
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchCategoriesData = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải danh sách danh mục");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCategoriesData();
    }, []),
  );

  // Mở modal thêm mới
  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setName("");
    setDescription("");
    setModalVisible(true);
  };

  // Mở modal sửa
  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || "");
    setModalVisible(true);
  };

  // Lưu thông tin (Thêm hoặc Sửa)
  const handleSaveCategory = async () => {
    if (!name.trim()) {
      Alert.alert("Lỗi", "Tên danh mục không được để trống");
      return;
    }

    try {
      setSubmitting(true);
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name: name.trim(),
          description: description.trim(),
        });
      } else {
        await createCategory({
          name: name.trim(),
          description: description.trim(),
        });
      }
      setModalVisible(false);
      fetchCategoriesData();
    } catch (error) {
      Alert.alert("Lỗi", "Không thể lưu danh mục");
    } finally {
      setSubmitting(false);
    }
  };

  // Xóa danh mục kèm kiểm tra ràng buộc khóa học
  const handleDeleteCategory = async (cat: Category) => {
    try {
      // 1. Lấy danh sách toàn bộ khóa học để kiểm tra quan hệ
      const courses: Course[] = await getCourses();
      const hasCourses = courses.some((course) => course.categoryId === cat.id);

      // 2. Chặn xóa nếu danh mục đang chứa khóa học
      if (hasCourses) {
        Alert.alert(
          "Không thể xóa",
          `Danh mục "${cat.name}" đang có khóa học liên kết. Bạn cần xóa hoặc chuyển khóa học trước khi xóa danh mục này!`,
        );
        return;
      }

      // 3. Xác nhận xóa nếu không có khóa học nào thuộc danh mục
      Alert.alert(
        "Xác nhận xóa",
        `Bạn có chắc muốn xóa danh mục "${cat.name}"?`,
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Xóa",
            style: "destructive",
            onPress: async () => {
              try {
                await deleteCategory(cat.id);
                fetchCategoriesData();
              } catch (error) {
                Alert.alert("Lỗi", "Không thể xóa danh mục");
              }
            },
          },
        ],
      );
    } catch (error) {
      Alert.alert("Lỗi", "Không thể kiểm tra dữ liệu khóa học");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Nút Thêm danh mục */}
        <TouchableOpacity style={styles.addBtn} onPress={handleOpenAddModal}>
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.addBtnText}>Thêm danh mục mới</Text>
        </TouchableOpacity>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : (
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.catInfo}>
                  <Text style={styles.catName}>{item.name}</Text>
                  <Text style={styles.catDesc}>
                    {item.description || "Không có mô tả"}
                  </Text>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => handleOpenEditModal(item)}
                  >
                    <Ionicons name="pencil-outline" size={18} color="#007AFF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteCategory(item)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#dc3545" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.centerContainer}>
                <Text style={styles.emptyText}>Chưa có danh mục nào.</Text>
              </View>
            }
          />
        )}

        {/* Modal Thêm / Sửa Danh mục */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {editingCategory ? "Sửa Danh mục" : "Thêm Danh mục"}
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Tên danh mục *"
                value={name}
                onChangeText={setName}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Mô tả danh mục"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.cancelBtn]}
                  onPress={() => setModalVisible(false)}
                  disabled={submitting}
                >
                  <Text style={styles.cancelBtnText}>Hủy</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalBtn, styles.saveBtn]}
                  onPress={handleSaveCategory}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveBtnText}>Lưu</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8f9fa" },
  container: { flex: 1, padding: 16 },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#28a745",
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 6,
  },
  addBtnText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  catInfo: { flex: 1, paddingRight: 10 },
  catName: { fontSize: 16, fontWeight: "bold", color: "#212529" },
  catDesc: { fontSize: 13, color: "#6c757d", marginTop: 3 },
  actions: { flexDirection: "row", gap: 10 },
  editBtn: {
    padding: 8,
    backgroundColor: "#e7f3ff",
    borderRadius: 6,
  },
  deleteBtn: {
    padding: 8,
    backgroundColor: "#ffebe6",
    borderRadius: 6,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  emptyText: { color: "#868e96", fontSize: 14 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 14 },
  input: {
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    fontSize: 14,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 8,
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 6,
  },
  cancelBtn: { backgroundColor: "#e9ecef" },
  cancelBtnText: { color: "#495057", fontWeight: "600" },
  saveBtn: { backgroundColor: "#007AFF" },
  saveBtnText: { color: "#fff", fontWeight: "bold" },
});
