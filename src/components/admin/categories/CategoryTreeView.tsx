import { Badge } from '@/components/ui/badge';
import { Folder, Layers } from 'lucide-react';
import { Category } from '@/types/category';

export const getStatusBadge = (status: boolean) => {
  return status ? (
    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0 rounded-lg px-2.5 py-0.5 shadow-none">
      Hoạt động
    </Badge>
  ) : (
    <Badge
      variant="outline"
      className="bg-gray-100 text-gray-600 border-0 rounded-lg px-2.5 py-0.5 shadow-none"
    >
      Ngừng hoạt động
    </Badge>
  );
};

interface CategoryTreeViewProps {
  categories: Category[];
  getChildCategories: (parentId: string) => Category[];
  getProductCount: (category: Category) => number;
}

export function CategoryTreeView({
  categories,
  getChildCategories,
  getProductCount,
}: CategoryTreeViewProps) {
  const rootCategories = categories.filter((category) => !category.parentCategory);

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {rootCategories.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-gray-50/50 rounded-[1.5rem] border border-dashed border-border/50">
            Không tìm thấy danh mục
          </div>
        ) : (
          rootCategories.map((category) => (
            <div
              key={category._id}
              className="border border-border/50 rounded-2xl p-5 bg-white/40 hover:bg-white/60 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <Folder className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm tracking-tight">
                      {category.name}
                    </h4>
                    {category.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded-lg">
                    <span className="font-medium">{getProductCount(category)}</span> sản phẩm
                  </div>
                  {getStatusBadge(category.isActive)}
                </div>
              </div>

              {getChildCategories(category._id as string).length > 0 && (
                <div className="mt-4 ml-5 space-y-3 border-l-[1.5px] border-border/40 pl-6 py-1">
                  {getChildCategories(category._id as string).map((subCategory) => (
                    <div
                      key={subCategory._id}
                      className="flex items-center justify-between py-2 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500 border border-border/50 group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                          <Layers className="h-4 w-4" />
                          <div className="absolute -left-[1.60rem] top-1/2 w-4 h-[1.5px] bg-border/40"></div>
                        </div>

                        <div>
                          <h5 className="font-medium text-sm text-foreground">
                            {subCategory.name}
                          </h5>
                          {subCategory.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                              {subCategory.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-gray-50 px-2 py-0.5 rounded-md border border-border/50">
                          {getProductCount(subCategory)} sản phẩm
                        </div>
                        {getStatusBadge(subCategory.isActive)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
