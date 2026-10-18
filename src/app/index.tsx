import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getCategories, getCourses } from "../api/apiService";

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  instructor: string;
  price: number;
  duration: number;
  thumbnail: string;
  trailerUrl: string;
  createdAt: string;
}

export default function CourseListScreen() {
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");

  const fetchData = async () => {
    try {
      const [coursesData, categoriesData] = await Promise.all([
        getCourses(),
        getCategories(),
      ]);
      setCourses(coursesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getCategoryName = (catId: string) => {
    const found = categories.find((cat) => cat.id === catId);
    return found ? found.name : "Chưa phân loại";
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategoryId === "all" || course.categoryId === selectedCategoryId;
    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={20} color="#777" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm khóa học..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={styles.categoryManageBtn}
            onPress={() => router.push("/explore")}
          >
            <Ionicons name="folder-outline" size={20} color="#fff" />
            <Text style={styles.btnText}>Danh mục</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categoryFilterContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[{ id: "all", name: "Tất cả" }, ...categories]}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isSelected = selectedCategoryId === item.id;
              return (
                <TouchableOpacity
                  style={[
                    styles.categoryChip,
                    isSelected && styles.categoryChipActive,
                  ]}
                  onPress={() => setSelectedCategoryId(item.id)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      isSelected && styles.categoryChipTextActive,
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredCourses}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.8}
                onPress={() =>
                  router.push({
                    pathname: "/course-detail",
                    params: { id: item.id },
                  })
                }
              >
                <Image
                  source={{
                    uri:
                      item.thumbnail ||
                      "https://via.placeholder.com/150?text=No+Image",
                  }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
                <View style={styles.cardContent}>
                  <Text style={styles.badgeCategory}>
                    {getCategoryName(item.categoryId)}
                  </Text>
                  <Text style={styles.title} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.instructor}>
                    Giảng viên: {item.instructor}
                  </Text>
                  <Text style={styles.price}>
                    {Number(item.price).toLocaleString("vi-VN")} đ
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.centerContainer}>
                <Ionicons name="school-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>
                  Không tìm thấy khóa học nào phù hợp.
                </Text>
              </View>
            }
            contentContainerStyle={
              filteredCourses.length === 0
                ? { flexGrow: 1 }
                : { paddingBottom: 20 }
            }
          />
        )}
        <TouchableOpacity
          style={styles.addCourseBtn}
          onPress={() => router.push("/course-form")}
        >
          <Ionicons name="add-circle-outline" size={22} color="#fff" />
          <Text style={styles.addCourseBtnText}>Thêm khóa học mới</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8f9fa" },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#e1e4e8",
    height: 44,
  },
  searchInput: { flex: 1, marginLeft: 6, fontSize: 14, color: "#333" },
  categoryManageBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#28a745",
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 8,
    gap: 4,
  },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  categoryFilterContainer: { marginBottom: 12, maxHeight: 38 },
  categoryChip: {
    backgroundColor: "#e9ecef",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    justifyContent: "center",
  },
  categoryChipActive: { backgroundColor: "#007AFF" },
  categoryChipText: { fontSize: 13, color: "#495057" },
  categoryChipTextActive: { color: "#fff", fontWeight: "bold" },
  addCourseBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 14,
    gap: 6,
  },
  addCourseBtnText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  thumbnail: { width: 110, height: 110 },
  cardContent: { flex: 1, padding: 10, justifyContent: "space-between" },
  badgeCategory: {
    alignSelf: "flex-start",
    backgroundColor: "#e7f3ff",
    color: "#007AFF",
    fontSize: 11,
    fontWeight: "bold",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  title: { fontSize: 15, fontWeight: "bold", color: "#212529", marginTop: 4 },
  instructor: { fontSize: 12, color: "#6c757d", marginTop: 2 },
  price: { fontSize: 14, fontWeight: "700", color: "#dc3545", marginTop: 4 },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 8, color: "#6c757d" },
  emptyText: { marginTop: 10, color: "#868e96", fontSize: 14 },
});
