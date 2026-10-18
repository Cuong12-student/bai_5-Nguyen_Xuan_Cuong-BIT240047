import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { deleteCourse, getCategories, getCourseById } from "../api/apiService";

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

function TrailerPlayer({ url }: { url: string }) {
  const player = useVideoPlayer({ uri: url }, (p) => {
    p.loop = true;
    p.play();
  });

  return (
    <VideoView
      style={styles.mediaPlayer}
      player={player}
      nativeControls={true}
      contentFit="contain"
    />
  );
}

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [categoryName, setCategoryName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [showVideo, setShowVideo] = useState<boolean>(false);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [courseData, categoriesData] = await Promise.all([
          getCourseById(id),
          getCategories().catch(() => []),
        ]);
        setCourse(courseData);

        const foundCat = Array.isArray(categoriesData)
          ? categoriesData.find(
              (cat: any) => String(cat.id) === String(courseData.categoryId),
            )
          : null;
        setCategoryName(foundCat ? foundCat.name : "Chưa phân loại");
      } catch (error) {
        Alert.alert("Lỗi", "Không thể tải thông tin khóa học");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const handleDelete = () => {
    if (!course) return;

    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc muốn xóa khóa học "${course.title}"?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCourse(course.id);
              Alert.alert("Thành công", "Đã xóa khóa học thành công", [
                { text: "OK", onPress: () => router.back() },
              ]);
            } catch (error) {
              Alert.alert("Lỗi", "Không thể xóa khóa học");
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!course) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Không tìm thấy thông tin khóa học.</Text>
      </View>
    );
  }

  // Làm sạch link ảnh và video để tránh lỗi do khoảng trắng thừa
  const cleanThumbnail = course.thumbnail ? course.thumbnail.trim() : "";
  const cleanTrailerUrl = course.trailerUrl ? course.trailerUrl.trim() : "";

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Media: Video trailer hoặc Ảnh bìa */}
        <View style={styles.mediaContainer}>
          {showVideo && cleanTrailerUrl ? (
            <TrailerPlayer url={cleanTrailerUrl} />
          ) : (
            <Image
              source={{
                uri:
                  cleanThumbnail !== ""
                    ? cleanThumbnail
                    : "https://via.placeholder.com/400x240?text=No+Image",
              }}
              style={styles.imageThumbnail}
              resizeMode="contain"
            />
          )}
        </View>

        {/* Nút bật/tắt xem trailer */}
        {cleanTrailerUrl ? (
          <TouchableOpacity
            style={styles.trailerBtn}
            onPress={() => setShowVideo(!showVideo)}
          >
            <Ionicons
              name={showVideo ? "image-outline" : "play-circle-outline"}
              size={20}
              color="#fff"
            />
            <Text style={styles.trailerBtnText}>
              {showVideo ? "Xem ảnh bìa" : "Xem trailer khóa học"}
            </Text>
          </TouchableOpacity>
        ) : null}

        {/* Thông tin chi tiết */}
        <View style={styles.infoBox}>
          <Text style={styles.badge}>{categoryName}</Text>
          <Text style={styles.title}>{course.title}</Text>
          <Text style={styles.price}>
            {Number(course.price || 0).toLocaleString("vi-VN")} đ
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="person-outline" size={16} color="#666" />
              <Text style={styles.metaText}>{course.instructor}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.metaText}>{course.duration} giờ</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionHeading}>Mô tả khóa học</Text>
          <Text style={styles.description}>
            {course.description || "Chưa có mô tả"}
          </Text>
        </View>

        {/* Nút Sửa / Xóa */}
        <View style={styles.actionGroup}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() =>
              router.push({
                pathname: "/course-form",
                params: { id: course.id },
              })
            }
          >
            <Ionicons name="create-outline" size={18} color="#fff" />
            <Text style={styles.actionText}>Chỉnh sửa</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={18} color="#fff" />
            <Text style={styles.actionText}>Xóa khóa học</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  scrollContent: { paddingBottom: 30 },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "#6c757d", fontSize: 15 },
  mediaContainer: {
    width: "100%",
    height: 240,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
  },
  imageThumbnail: {
    width: "100%",
    height: 240,
    backgroundColor: "#222",
  },
  mediaPlayer: {
    width: "100%",
    height: 240,
  },
  trailerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#17a2b8",
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    gap: 6,
  },
  trailerBtnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  infoBox: { padding: 16, backgroundColor: "#fff", marginTop: 12 },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#e7f3ff",
    color: "#007AFF",
    fontSize: 12,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 6,
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#dc3545",
    marginBottom: 10,
  },
  metaRow: { flexDirection: "row", gap: 20, marginBottom: 12 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 13, color: "#666" },
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 12 },
  sectionHeading: { fontSize: 16, fontWeight: "bold", marginBottom: 6 },
  description: { fontSize: 14, color: "#495057", lineHeight: 20 },
  actionGroup: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  editBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  deleteBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dc3545",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  actionText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
});
