// api/apiService.js
import axios from "axios";

const BASE_URL = "https://6ad3602e59dd78397bbba57d.mockapi.io/api/v1";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Courses API
export const getCourses = async () => (await apiClient.get("/courses")).data;
export const getCourseById = async (id) =>
  (await apiClient.get(`/courses/${id}`)).data;
export const createCourse = async (data) =>
  (await apiClient.post("/courses", data)).data;
export const updateCourse = async (id, data) =>
  (await apiClient.put(`/courses/${id}`, data)).data;
export const deleteCourse = async (id) =>
  (await apiClient.delete(`/courses/${id}`)).data;

// Categories API
export const getCategories = async () =>
  (await apiClient.get("/categories")).data;
export const createCategory = async (data) =>
  (await apiClient.post("/categories", data)).data;
export const updateCategory = async (id, data) =>
  (await apiClient.put(`/categories/${id}`, data)).data;
export const deleteCategory = async (id) =>
  (await apiClient.delete(`/categories/${id}`)).data;
