import { Stack } from "expo-router";
import { Text, View } from "react-native";
export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#007AFF" },
        headerTintColor: "#fff",
        headerTitleAlign: "center",
        // Tùy biến tiêu đề để tự do căn chỉnh lề trên mà không lỗi type
        headerTitle: ({ children }) => (
          <View style={{ paddingTop: 14 }}>
            <Text
              style={{
                color: "#fff",
                fontSize: 18,
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              {children}
            </Text>
          </View>
        ),
      }}
    >
      <Stack.Screen name="index" options={{ title: "Danh sách Khóa học" }} />
      <Stack.Screen name="explore" options={{ title: "Quản lý Danh mục" }} />
      <Stack.Screen
        name="course-detail"
        options={{ title: "Chi tiết Khóa học" }}
      />
      <Stack.Screen
        name="course-form"
        options={{ title: "Thêm / Sửa Khóa học" }}
      />
    </Stack>
  );
}
