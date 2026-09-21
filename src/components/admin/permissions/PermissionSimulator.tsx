'use client';

import { useState } from 'react';
import {
  Play,
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RESOURCES, ACTIONS } from '@/constants/permissions';
import { getUserPermissions } from '@/api';
import { useAllUsers } from '@/hooks/queries';
import { User } from '@/types/user';
import { cn } from '@/utils/cn';
import {
  adminFieldSurfaceClass,
  adminInsetPanelClass,
  adminPrimaryButtonClass,
  adminSurfaceClass,
} from '@/components/admin/shared/AdminPrimitives';

interface SimulationTraceStep {
  title: string;
  verdict: 'passed' | 'failed' | 'skipped';
  explanation: string;
}

interface SimulationResult {
  allowed: boolean;
  finalReason: string;
  ruleMatched: string;
  trace: SimulationTraceStep[];
}

interface PermissionSimulatorProps {
  rolePermissions: Record<string, string[]>;
}

export default function PermissionSimulator({ rolePermissions }: PermissionSimulatorProps) {
  const [targetType, setTargetType] = useState<'role' | 'user'>('role');
  const [selectedRole, setSelectedRole] = useState<string>('seller');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userSearchOpen, setUserSearchOpen] = useState(false);

  const [selectedResource, setSelectedResource] = useState<string>('product');
  const [selectedAction, setSelectedAction] = useState<string>('create');

  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);

  // Search users if targetType is user
  const { data: usersData, isLoading: searchingUsers } = useAllUsers({
    page: 1,
    limit: 6,
    search: userSearchQuery.trim() || undefined,
  });
  const userResults = usersData?.users || [];

  const handleRunSimulation = async () => {
    setEvaluating(true);
    setResult(null);

    const targetPerm = `${selectedResource}:${selectedAction}`;
    const trace: SimulationTraceStep[] = [];

    try {
      let role = selectedRole;
      let userOverrides: string[] = [];

      if (targetType === 'user' && selectedUser) {
        // Fetch user's latest permissions
        const userPermsRes = await getUserPermissions(selectedUser._id);
        role = userPermsRes?.user?.roles || selectedUser.roles || 'user';
        userOverrides = userPermsRes?.userPermissions || [];
      }

      const rolePerms = rolePermissions[role] || [];

      // Step 1: Check Explicit Negative Override (-perm)
      if (userOverrides.includes(`-${targetPerm}`) || userOverrides.includes('-*:*')) {
        trace.push({
          title: '1. Kiểm tra cấm quyền riêng (Explicit Deny)',
          verdict: 'failed',
          explanation: `Phát hiện cờ từ chối trực tiếp: -${targetPerm}. Quyền bị chặn ngay lập tức.`,
        });
        setResult({
          allowed: false,
          finalReason: `Tài khoản bị từ chối trực tiếp thông qua cờ tước quyền: -${targetPerm}`,
          ruleMatched: `-${targetPerm}`,
          trace,
        });
        return;
      }
      trace.push({
        title: '1. Kiểm tra cấm quyền riêng (Explicit Deny)',
        verdict: 'passed',
        explanation: 'Không có cờ từ chối quyền nào áp dụng cho hành động này.',
      });

      // Step 2: Check Explicit Positive Override (+perm)
      if (userOverrides.includes(targetPerm) || userOverrides.includes('*:*')) {
        trace.push({
          title: '2. Kiểm tra cấp đặc quyền riêng (Explicit Grant)',
          verdict: 'passed',
          explanation: `Tài khoản được cấp riêng quyền đặc biệt: ${targetPerm}.`,
        });
        setResult({
          allowed: true,
          finalReason: `Được cấp phép thông qua đặc quyền riêng của tài khoản (${targetPerm})`,
          ruleMatched: targetPerm,
          trace,
        });
        return;
      }
      trace.push({
        title: '2. Kiểm tra cấp đặc quyền riêng (Explicit Grant)',
        verdict: 'skipped',
        explanation: 'Không có đặc quyền cấp riêng, tiếp tục đối soát quyền từ vai trò.',
      });

      // Step 3: Check Wildcard Super Admin (*:*)
      if (rolePerms.includes('*:*') || rolePerms.includes('*')) {
        trace.push({
          title: '3. Kiểm tra siêu quyền Admin (*:*)',
          verdict: 'passed',
          explanation: `Vai trò [${role}] sở hữu siêu quyền *:* bao phủ toàn bộ tài nguyên.`,
        });
        setResult({
          allowed: true,
          finalReason: `Được cấp phép thông qua siêu quyền quản trị (*:*) của vai trò ${role}`,
          ruleMatched: '*:*',
          trace,
        });
        return;
      }
      trace.push({
        title: '3. Kiểm tra siêu quyền Admin (*:*)',
        verdict: 'skipped',
        explanation: `Vai trò [${role}] không có siêu quyền *:*`,
      });

      // Step 4: Check Resource Wildcard or Manage (resource:* or resource:manage)
      if (
        rolePerms.includes(`${selectedResource}:*`) ||
        rolePerms.includes(`${selectedResource}:manage`)
      ) {
        trace.push({
          title: '4. Kiểm tra quyền bao phủ tài nguyên (Resource Wildcard)',
          verdict: 'passed',
          explanation: `Vai trò [${role}] sở hữu quyền bao phủ ${selectedResource}:*`,
        });
        setResult({
          allowed: true,
          finalReason: `Được cấp phép thông qua quyền quản trị tài nguyên (${selectedResource}:*) của vai trò ${role}`,
          ruleMatched: `${selectedResource}:*`,
          trace,
        });
        return;
      }

      // Step 5: Check Specific Role Permission (resource:action)
      if (rolePerms.includes(targetPerm)) {
        trace.push({
          title: '5. Kiểm tra quyền cụ thể theo vai trò (Direct Role Permission)',
          verdict: 'passed',
          explanation: `Quyền ${targetPerm} nằm trong danh sách quyền mặc định của vai trò [${role}].`,
        });
        setResult({
          allowed: true,
          finalReason: `Được cấp phép trực tiếp từ vai trò ${role} (${targetPerm})`,
          ruleMatched: targetPerm,
          trace,
        });
        return;
      }

      // Final: Denied
      trace.push({
        title: '5. Kiểm tra quyền cụ thể theo vai trò (Direct Role Permission)',
        verdict: 'failed',
        explanation: `Vai trò [${role}] không có quyền thực hiện hành động ${selectedAction} trên tài nguyên ${selectedResource}.`,
      });
      setResult({
        allowed: false,
        finalReason: `Từ chối truy cập: Vai trò ${role} không được cấu hình quyền ${targetPerm}`,
        ruleMatched: 'NO_MATCHING_RULE',
        trace,
      });
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className={cn(adminSurfaceClass, 'p-6 space-y-6')}>
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Trình giả lập & Kiểm tra quyền truy cập (Permission Simulator)
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Mô phỏng chính xác thuật toán đánh giá quyền của server để biết một tài khoản hoặc vai trò
            có được phép thực hiện hành động hay không.
          </p>
        </div>

        {/* Inputs Configuration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Target Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              1. Đối tượng kiểm tra
            </label>
            <div className="grid grid-cols-2 gap-1 p-1 bg-muted rounded-lg">
              <button
                type="button"
                onClick={() => setTargetType('role')}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                  targetType === 'role'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                Theo Vai trò
              </button>
              <button
                type="button"
                onClick={() => setTargetType('user')}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                  targetType === 'user'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                Người dùng cụ thể
              </button>
            </div>
          </div>

          {/* Role or User Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              2. Chọn {targetType === 'role' ? 'Vai trò' : 'Tài khoản'}
            </label>
            {targetType === 'role' ? (
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className={cn(adminFieldSurfaceClass, 'h-10')}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Quản trị viên (Admin)</SelectItem>
                  <SelectItem value="seller">Người bán hàng (Seller)</SelectItem>
                  <SelectItem value="buyer">Người mua (Buyer/User)</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="relative">
                <div
                  onClick={() => setUserSearchOpen(!userSearchOpen)}
                  className={cn(
                    adminFieldSurfaceClass,
                    'h-10 px-3 flex items-center justify-between cursor-pointer text-sm',
                  )}
                >
                  <span className={selectedUser ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                    {selectedUser ? selectedUser.username : 'Chọn tài khoản...'}
                  </span>
                  <Search className="h-3.5 w-3.5 text-muted-foreground" />
                </div>

                {userSearchOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-lg border border-border bg-popover p-2 shadow-lg max-h-56 overflow-y-auto">
                    <Input
                      placeholder="Tìm username/email..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="h-8 text-xs mb-2"
                      autoFocus
                    />
                    {searchingUsers ? (
                      <div className="text-center py-2 text-xs text-muted-foreground">Đang tải...</div>
                    ) : (
                      userResults.map((u) => (
                        <button
                          key={u._id}
                          type="button"
                          onClick={() => {
                            setSelectedUser(u);
                            setUserSearchOpen(false);
                          }}
                          className="w-full text-left px-2 py-1.5 rounded hover:bg-muted text-xs flex justify-between items-center"
                        >
                          <span className="font-medium">{u.username}</span>
                          <Badge variant="outline" className="text-[10px] capitalize">
                            {u.roles}
                          </Badge>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Resource Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              3. Tài nguyên (Resource)
            </label>
            <Select value={selectedResource} onValueChange={setSelectedResource}>
              <SelectTrigger className={cn(adminFieldSurfaceClass, 'h-10 capitalize')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-56">
                {Object.values(RESOURCES).map((res) => (
                  <SelectItem key={res} value={res} className="capitalize">
                    {res}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              4. Hành động (Action)
            </label>
            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger className={cn(adminFieldSurfaceClass, 'h-10')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ACTIONS).map((act) => (
                  <SelectItem key={act} value={act}>
                    {act}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Submit Simulation Button */}
        <div className="flex justify-end pt-2">
          <Button
            onClick={handleRunSimulation}
            disabled={evaluating || (targetType === 'user' && !selectedUser)}
            className={cn('gap-2 px-6', adminPrimaryButtonClass)}
          >
            <Play className="h-4 w-4 fill-current" />
            Kiểm tra quyền truy cập ({selectedResource}:{selectedAction})
          </Button>
        </div>
      </div>

      {/* Simulation Result Presentation */}
      {result && (
        <div
          className={cn(
            adminSurfaceClass,
            'p-6 space-y-6 border-l-4 transition-all animate-in fade-in-50',
            result.allowed
              ? 'border-l-emerald-500 bg-emerald-500/[0.02]'
              : 'border-l-rose-500 bg-rose-500/[0.02]',
          )}
        >
          {/* Main Verdict Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {result.allowed ? (
                <div className="h-12 w-12 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-7 w-7" />
                </div>
              ) : (
                <div className="h-12 w-12 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <ShieldAlert className="h-7 w-7" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">
                    {result.allowed ? 'CHO PHÉP TRUY CẬP (ALLOWED)' : 'TỪ CHỐI TRUY CẬP (DENIED)'}
                  </span>
                  <Badge
                    variant="outline"
                    className="font-mono text-xs px-2 py-0.5 bg-background"
                  >
                    {selectedResource}:{selectedAction}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{result.finalReason}</p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-xs text-muted-foreground">Quy tắc khớp:</span>
              <div className="font-mono text-xs font-semibold px-2.5 py-1 bg-muted rounded mt-0.5">
                {result.ruleMatched}
              </div>
            </div>
          </div>

          {/* Trace Pipeline Steps */}
          <div className="space-y-2 pt-2 border-t border-border">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Các bước đánh giá quyền hạn (Evaluation Trace)
            </h4>

            <div className="space-y-2.5">
              {result.trace.map((step, idx) => (
                <div
                  key={idx}
                  className={cn(
                    adminInsetPanelClass,
                    'p-3 flex items-start justify-between gap-3 text-xs',
                    step.verdict === 'passed' && 'border-emerald-500/30 bg-emerald-500/5',
                    step.verdict === 'failed' && 'border-rose-500/30 bg-rose-500/5',
                  )}
                >
                  <div className="space-y-1">
                    <div className="font-semibold text-foreground flex items-center gap-2">
                      {step.verdict === 'passed' && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      )}
                      {step.verdict === 'failed' && (
                        <XCircle className="h-4 w-4 text-rose-500 shrink-0" />
                      )}
                      {step.verdict === 'skipped' && (
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      )}
                      {step.title}
                    </div>
                    <p className="text-muted-foreground pl-6">{step.explanation}</p>
                  </div>

                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[10px] capitalize shrink-0',
                      step.verdict === 'passed' && 'text-emerald-600 border-emerald-500/30',
                      step.verdict === 'failed' && 'text-rose-600 border-rose-500/30',
                      step.verdict === 'skipped' && 'text-muted-foreground',
                    )}
                  >
                    {step.verdict}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
