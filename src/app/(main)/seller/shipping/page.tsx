'use client';
import { useState } from 'react';
import { Truck, Plus, Edit2, Trash2, Save, X, Package } from 'lucide-react';
import SpinnerLoading from '@/components/common/SpinnerLoading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  useMyShippingTemplates,
  useCreateShippingTemplate,
  useUpdateShippingTemplate,
  useDeleteShippingTemplate,
} from '@/hooks/queries';
import { ShippingTemplate, ShippingRule, CreateShippingTemplatePayload } from '@/types/shipping';
import { formatCurrency } from '@/utils/format';
import { getSafeErrorMessage } from '@/api';

export default function SellerShippingPage() {
  const { data: templates = [], isLoading } = useMyShippingTemplates();
  const createTemplateMutation = useCreateShippingTemplate();
  const updateTemplateMutation = useUpdateShippingTemplate();
  const deleteTemplateMutation = useDeleteShippingTemplate();
  const isCreating = createTemplateMutation.isPending;
  const isUpdating = updateTemplateMutation.isPending;
  const isDeleting = deleteTemplateMutation.isPending;

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateShippingTemplatePayload>({
    name: '',
    rules: [{ name: 'Phí cố định', type: 'fixed', baseFee: 30000 }],
    isDefault: false,
  });

  const handleAddRule = () => {
    setFormData((prev) => ({
      ...prev,
      rules: [...prev.rules, { name: '', type: 'fixed', baseFee: 0 }],
    }));
  };

  const handleRemoveRule = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index),
    }));
  };

  const handleRuleChange = (index: number, field: keyof ShippingRule, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      rules: prev.rules.map((rule, i) => (i === index ? { ...rule, [field]: value } : rule)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên template');
      return;
    }
    if (formData.rules.length === 0) {
      toast.error('Vui lòng thêm ít nhất một quy tắc');
      return;
    }

    try {
      if (editingId) {
        await updateTemplateMutation.mutateAsync({
          templateId: editingId,
          data: formData,
        });
        toast.success('Cập nhật template thành công!');
      } else {
        await createTemplateMutation.mutateAsync(formData);
        toast.success('Tạo template thành công!');
      }
      resetForm();
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, 'Thao tác thất bại'));
    }
  };

  const handleEdit = (template: ShippingTemplate) => {
    setEditingId(template._id);
    setFormData({
      name: template.name,
      rules: template.rules.map((r) => ({
        name: r.name,
        type: r.type,
        baseFee: r.baseFee,
        stepUnit: r.stepUnit,
        stepFee: r.stepFee,
      })),
      isDefault: template.isDefault,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa template này?')) return;
    try {
      await deleteTemplateMutation.mutateAsync(id);
      toast.success('Xóa template thành công!');
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, 'Xóa template thất bại'));
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      rules: [{ name: 'Phí cố định', type: 'fixed', baseFee: 30000 }],
      isDefault: false,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Truck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Phí vận chuyển</h1>
            <p className="text-sm text-muted-foreground">Quản lý các template phí ship của shop</p>
          </div>
        </div>
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-primary hover:bg-primary/90 rounded-xl h-11 px-5 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm template
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-foreground">
              {editingId ? 'Chỉnh sửa template' : 'Thêm template mới'}
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={resetForm}
              className="rounded-lg"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground">Tên template *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: Giao hàng tiêu chuẩn"
                  className="mt-1.5 h-11 rounded-xl border-0 bg-white"
                />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="rounded border-border w-4 h-4"
                  />
                  <span className="text-sm text-muted-foreground">Đặt làm mặc định</span>
                </label>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-foreground">Quy tắc tính phí</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddRule}
                  className="rounded-lg h-9 border-0 bg-white"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Thêm quy tắc
                </Button>
              </div>
              <div className="space-y-3">
                {formData.rules.map((rule, index) => (
                  <div
                    key={index}
                    className="flex flex-col md:flex-row md:items-center gap-3 p-3 bg-white rounded-xl"
                  >
                    <Input
                      className="h-10 w-full bg-muted/50 md:flex-1"
                      placeholder="Tên quy tắc"
                      value={rule.name}
                      onChange={(e) => handleRuleChange(index, 'name', e.target.value)}
                    />
                    <Select
                      value={rule.type}
                      onValueChange={(v) =>
                        handleRuleChange(index, 'type', v as ShippingRule['type'])
                      }
                    >
                      <SelectTrigger className="h-10 w-full bg-muted/50 md:w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Cố định</SelectItem>
                        <SelectItem value="weight_based">Theo cân</SelectItem>
                        <SelectItem value="quantity_based">Theo số lượng</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      className="h-10 w-full bg-muted/50 md:w-[130px]"
                      placeholder="Phí cơ bản"
                      value={rule.baseFee}
                      onChange={(e) => handleRuleChange(index, 'baseFee', Number(e.target.value))}
                    />
                    {formData.rules.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveRule(index)}
                        className="h-9 w-9 rounded-lg shrink-0 self-end md:self-auto"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Button
                type="submit"
                disabled={isCreating || isUpdating}
                className="bg-primary hover:bg-primary/90 rounded-xl h-11 px-5"
              >
                {isCreating || isUpdating ? (
                  <SpinnerLoading size={16} noWrapper className="mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {editingId ? 'Cập nhật' : 'Tạo template'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="rounded-xl h-11 border-0 bg-white"
              >
                Hủy
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Templates List */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <SpinnerLoading size={32} />
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="mb-2 font-semibold text-foreground">Chưa có template nào</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              Tạo template để quản lý phí vận chuyển
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-primary hover:bg-primary/90 rounded-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm template đầu tiên
            </Button>
          </div>
        ) : (
          <div>
            {templates.map((template, idx) => (
              <div
                key={template._id}
                className={`p-5 ${idx % 2 === 0 ? 'bg-white' : 'bg-white/50'}`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground">{template.name}</h3>
                        {template.isDefault && (
                          <Badge className="bg-primary/10 text-primary hover:bg-primary/10 rounded-full text-xs">
                            Mặc định
                          </Badge>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {template.rules.length} quy tắc
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(template)}
                      className="h-9 w-9 rounded-lg"
                    >
                      <Edit2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(template._id)}
                      disabled={isDeleting}
                      className="h-9 w-9 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 ml-13">
                  {template.rules.map((rule, i) => (
                    <span
                      key={i}
                      className="rounded-lg bg-muted px-3 py-1.5 text-xs text-muted-foreground"
                    >
                      {rule.name}:{' '}
                      <span className="font-medium text-foreground">
                        {formatCurrency(rule.baseFee)}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
