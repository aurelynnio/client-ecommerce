"use client";
import { useState } from "react";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/queries";
import { Category, CategoryFilters } from "@/types/category";
import { CategoriesHeader } from "@/components/admin/categories/CategoriesHeader";
import { CategoriesStats } from "@/components/admin/categories/CategoriesStats";
import { CategoriesTable } from "@/components/admin/categories/CategoriesTable";
import { PaginationControls } from "@/components/common/Pagination";
import { CategoryTreeView } from "@/components/admin/categories/CategoryTreeView";
import { EditCategoryModal } from "@/components/admin/categories/UpdateModel";
import { ViewCategoryModal } from "@/components/admin/categories/ViewModal";
import { CreateCategoryModal } from "@/components/admin/categories/CreateModel";
import { toast } from "sonner";
import { getSafeErrorMessage } from "@/api";

export default function CategoriesAdminPage() {
  // Use URL filters hook
  const { filters, updateFilter, updateFilters } =
    useUrlFilters<CategoryFilters>({
      defaultFilters: {
        page: 1,
        limit: 10,
        search: "",
      },
      basePath: "/admin/categories",
    });


  const currentPage = Number(filters.page);
  const pageSize = Number(filters.limit);
  const searchTerm = filters.search as string;


  const queryParams = {
    page: currentPage,
    limit: pageSize,
    ...(searchTerm && searchTerm.trim() !== ""
      ? { search: searchTerm.trim() }
      : { parentCategory: "null" }),
  };


  const { data: categoriesData, isLoading, error } = useCategories(queryParams);
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const categories: Category[] = categoriesData?.data || [];
  const pagination = categoriesData?.pagination || null;

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const handleOpenCreateModal = () => {
    setCreateModalOpen(true);
  };

  const handleCreateCategory = async (categoryData: {
    name: string;
    slug: string;
    description: string;
    isActive: boolean;
    parentCategory: string;
    images: string[];
  }) => {
    try {
      await createMutation.mutateAsync({
        ...categoryData,
        parentCategory:
          categoryData.parentCategory === ""
            ? undefined
            : categoryData.parentCategory,
      });

      setCreateModalOpen(false);
      toast.success("Category created successfully");
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, "Error creating category. Please try again."));
    }
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setEditModalOpen(true);
  };

  const handleEditFromView = (category: Category) => {
    setSelectedCategory(category);
    setViewModalOpen(false);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedCategory(null);
  };

  const handleSaveCategory = async (categoryData: Partial<Category>) => {
    if (!selectedCategory) return;

    try {
      await updateMutation.mutateAsync({
        id: selectedCategory._id,
        ...categoryData,
      } as {
        id: string;
        name: string;
        slug: string;
        description?: string;
        isActive: boolean;
        isFeatured?: boolean;
      });

      handleCloseEditModal();

      toast.success("Category updated successfully");
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, "Failed to update category. Please try again."));
    }
  };

  // Filter handlers
  const handlePageChange = (page: number) => {
    updateFilter("page", page);
  };

  const handlePageSizeChange = (size: number) => {
    updateFilters({ limit: size, page: 1 });
  };

  const handleSearch = (value: string) => {
    updateFilters({ search: value, page: 1 });
  };

  const getParentName = (category: Category) => {
    if (
      category.parentCategory &&
      typeof category.parentCategory === "object"
    ) {
      return category.parentCategory.name;
    }
    return "-";
  };

  const getChildCategories = (parentId: string) => {
    return categories.filter((category) => {
      if (!category.parentCategory) return false;
      if (typeof category.parentCategory === "string") {
        return category.parentCategory === parentId;
      }
      return category.parentCategory._id === parentId;
    });
  };

  const getProductCount = (category: Category) => {
    return category.productCount || 0;
  };

  const handleCloseModals = () => {
    setViewModalOpen(false);
    setEditModalOpen(false);
    setSelectedCategory(null);
  };

  const handleDeleteCategory = (category: Category) => {
    deleteMutation.mutate(category._id as string);
  };

  const handleViewCategory = (category: Category) => {
    setSelectedCategory(category);
    setViewModalOpen(true);
  };

  const totalCategories = pagination?.totalItems || categories.length;
  const activeCategories = categories.filter((cat) => cat.isActive).length;
  const childCategories = categories.filter((cat) => cat.parentCategory).length;
  const totalProducts = categories.reduce(
    (total, cat) => total + (cat.productCount || 0),
    0
  );

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">
          Error: {getSafeErrorMessage(error, "Failed to load categories")}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-1">
      {/* Header Section */}
      <CategoriesHeader onAddCategory={handleOpenCreateModal} />

      {/* Stats Section */}
      <CategoriesStats
        totalCategories={totalCategories}
        activeCategories={activeCategories}
        childCategories={childCategories}
        totalProducts={totalProducts}
      />

      {/* Main Content Area */}
      <div className="space-y-6">
        <CategoriesTable
          categories={categories}
          searchTerm={searchTerm}
          pageSize={pageSize}
          isLoading={isLoading}
          onSearch={handleSearch}
          onPageSizeChange={handlePageSizeChange}
          onEdit={handleEditCategory}
          onDelete={handleDeleteCategory}
          onView={handleViewCategory}
          getParentName={getParentName}
          getProductCount={getProductCount}
        />

        <div className="mt-6">
          <PaginationControls
            pagination={pagination}
            onPageChange={handlePageChange}
            itemName="categories"
          />
        </div>

        <CreateCategoryModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onCreate={handleCreateCategory}
          categories={categories}
          isLoading={createMutation.isPending}
        />

        <ViewCategoryModal
          isOpen={viewModalOpen}
          onClose={handleCloseModals}
          onEdit={handleEditFromView}
          category={selectedCategory}
        />

        <EditCategoryModal
          isOpen={editModalOpen}
          onClose={handleCloseEditModal}
          onSave={handleSaveCategory}
          category={selectedCategory}
          isLoading={updateMutation.isPending}
        />
      </div>

      {/* Tree View Section */}
      <div className="rounded-2xl bg-[#f7f7f7] dark:bg-[#1C1C1E] p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Structure View
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Hierarchical view of categories
          </p>
        </div>
        <CategoryTreeView
          categories={categories}
          getChildCategories={getChildCategories}
          getProductCount={getProductCount}
        />
      </div>
    </div>
  );
}
