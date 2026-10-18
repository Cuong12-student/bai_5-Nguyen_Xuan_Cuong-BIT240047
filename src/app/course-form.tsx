import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  createCourse,
  getCategories,
  getCourseById,
  updateCourse,
} from "../api/apiService";

interface Category {
  id: string;
  name: string;
  description?: string;
}

export default function CourseFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditMode = Boolean(id);
  const router = useRouter();

  // State các trường dữ liệu
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [instructor, setInstructor] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [trailerUrl, setTrailerUrl] = useState("");

  // State giao diện
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalCategoryVisible, setModalCategoryVisible] = useState(false);

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const cats = await getCategories();
        setCategories(cats);

        if (isEditMode && id) {
          const course = await getCourseById(id);
          setTitle(course.title || "");
          setDescription(course.description || "");
          setCategoryId(String(course.categoryId) || "");
          setInstructor(course.instructor || "");
          setPrice(String(course.price ?? ""));
          setDuration(String(course.duration ?? ""));
          setThumbnail(course.thumbnail || "");
          setTrailerUrl(course.trailerUrl || "");
        } else if (cats.length > 0) {
          setCategoryId(String(cats[0].id));
        }
      } catch (error) {
        Alert.alert("Lỗi", "Không thể tải thông tin khởi tạo");
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [id]);

  const selectedCategoryName =
    categories.find((c) => String(c.id) === String(categoryId))?.name ||
    "Chọn danh mục";

  const validate = () => {
    if (!title.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên khóa học");
      return false;
    }
    if (!categoryId) {
      Alert.alert("Lỗi", "Vui lòng chọn danh mục khóa học");
      return false;
    }
    if (!instructor.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên giảng viên");
      return false;
    }
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0 || price.trim() === "") {
      Alert.alert("Lỗi", "Học phí phải là số không âm");
      return false;
    }
    const numDuration = Number(duration);
    if (isNaN(numDuration) || numDuration < 0 || duration.trim() === "") {
      Alert.alert("Lỗi", "Thời lượng phải là số không âm");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      setSubmitting(true);
      const payload = {
        title: title.trim(),
        description: description.trim(),
        categoryId,
        instructor: instructor.trim(),
        price: Number(price),
        duration: Number(duration),
        thumbnail: thumbnail.trim(),
        trailerUrl: trailerUrl.trim(),
        createdAt: new Date().toISOString().split("T")[0],
      };

      if (isEditMode && id) {
        await updateCourse(id, payload);
        Alert.alert("Thành công", "Cập nhật khóa học thành công", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        await createCourse(payload);
        Alert.alert("Thành công", "Thêm khóa học mới thành công", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Có lỗi xảy ra khi lưu khóa học");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerTitle}>
          {isEditMode ? "Chỉnh sửa khóa học" : "Thêm khóa học mới"}
        </Text>

        <Text style={styles.label}>Tên khóa học *</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập tên khóa học"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Danh mục *</Text>
        <TouchableOpacity
          style={styles.selectBtn}
          onPress={() => setModalCategoryVisible(true)}
        >
          <Text style={styles.selectBtnText}>{selectedCategoryName}</Text>
          <Ionicons name="chevron-down-outline" size={18} color="#666" />
        </TouchableOpacity>

        <Text style={styles.label}>Giảng viên *</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập tên giảng viên"
          value={instructor}
          onChangeText={setInstructor}
        />

        <View style={styles.row}>
          <View style={styles.flexHalf}>
            <Text style={styles.label}>Học phí (VNĐ) *</Text>
            <TextInput
              style={styles.input}
              placeholder="500000"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
          </View>
          <View style={styles.flexHalf}>
            <Text style={styles.label}>Thời lượng (giờ) *</Text>
            <TextInput
              style={styles.input}
              placeholder="30"
              keyboardType="numeric"
              value={duration}
              onChangeText={setDuration}
            />
          </View>
        </View>

        <Text style={styles.label}>URL Ảnh bìa</Text>
        <TextInput
          style={styles.input}
          placeholder="https://example.com/image.jpg"
          value={thumbnail}
          onChangeText={setThumbnail}
          autoCapitalize="none"
        />

        {thumbnail.trim() !== "" ? (
          <View style={styles.previewBox}>
            <Text style={styles.previewLabel}>Xem trước ảnh bìa:</Text>
            <Image
              source={{ uri: thumbnail }}
              style={styles.previewImage}
              resizeMode="cover"
            />
          </View>
        ) : null}

        <Text style={styles.label}>URL Video Trailer (.mp4)</Text>
        <TextInput
          style={styles.input}
          placeholder="https://example.com/trailer.mp4"
          value={trailerUrl}
          onChangeText={setTrailerUrl}
          autoCapitalize="none"
        />

        <Text style={styles.label}>Mô tả khóa học</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Nhập mô tả khóa học"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSave}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>
              {isEditMode ? "Cập nhật khóa học" : "Lưu khóa học"}
            </Text>
          )}
        </TouchableOpacity>

        <Modal
          visible={modalCategoryVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalCategoryVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Chọn danh mục</Text>
                <TouchableOpacity
                  onPress={() => setModalCategoryVisible(false)}
                >
                  <Ionicons name="close" size={22} color="#333" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={categories}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.categoryOption,
                      String(item.id) === String(categoryId) &&
                        styles.categoryOptionActive,
                    ]}
                    onPress={() => {
                      setCategoryId(String(item.id));
                      setModalCategoryVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        String(item.id) === String(categoryId) &&
                          styles.categoryOptionTextActive,
                      ]}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8f9fa" },
  container: { padding: 16, paddingBottom: 40 },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 16,
  },
  label: { fontSize: 13, fontWeight: "600", color: "#495057", marginBottom: 6 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 14,
  },
  row: { flexDirection: "row", gap: 12 },
  flexHalf: { flex: 1 },
  textArea: { height: 90, textAlignVertical: "top" },
  selectBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 14,
  },
  selectBtnText: { fontSize: 14, color: "#212529" },
  previewBox: { marginBottom: 14 },
  previewLabel: { fontSize: 12, color: "#6c757d", marginBottom: 4 },
  previewImage: {
    width: "100%",
    height: 160,
    borderRadius: 8,
    backgroundColor: "#e9ecef",
  },
  submitBtn: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  submitBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: "60%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 16, fontWeight: "bold" },
  categoryOption: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f1f1",
  },
  categoryOptionActive: { backgroundColor: "#e7f3ff", borderRadius: 6 },
  categoryOptionText: { fontSize: 14, color: "#333" },
  categoryOptionTextActive: { color: "#007AFF", fontWeight: "bold" },
});
