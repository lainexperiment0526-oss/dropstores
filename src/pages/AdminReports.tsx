import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertTriangle,
  Flag,
  Store,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Loader2,
  Calendar,
  Mail,
  FileText,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface StoreReport {
  id: string;
  store_id: string;
  product_id: string | null;
  report_type: string;
  description: string;
  reporter_email: string | null;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  stores: {
    name: string;
    slug: string;
  };
  products?: {
    name: string;
  } | null;
}

export default function AdminReports() {
  const [reports, setReports] = useState<StoreReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<StoreReport | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      let query = (supabase as any)
        .from('store_reports')
        .select(`
          *,
          stores:store_id (name, slug),
          products:product_id (name)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: 'Error',
        description: 'Failed to load reports. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (report: StoreReport) => {
    setSelectedReport(report);
    setAdminNotes(report.admin_notes || '');
    setDetailsOpen(true);
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedReport) return;

    setUpdating(true);
    try {
      const { error } = await (supabase as any)
        .from('store_reports')
        .update({
          status: newStatus,
          admin_notes: adminNotes.trim() || null,
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq('id', selectedReport.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Report status updated to ${newStatus}.`,
      });

      setDetailsOpen(false);
      fetchReports();
    } catch (error) {
      console.error('Error updating report:', error);
      toast({
        title: 'Error',
        description: 'Failed to update report status.',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: any }> = {
      pending: { color: 'bg-yellow-500', icon: Clock },
      reviewed: { color: 'bg-blue-500', icon: Eye },
      resolved: { color: 'bg-green-500', icon: CheckCircle },
      dismissed: { color: 'bg-gray-500', icon: XCircle },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getReportTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      illegal: 'Illegal Products',
      fraud: 'Fraudulent/Scam',
      inappropriate: 'Inappropriate Content',
      counterfeit: 'Counterfeit Products',
      copyright: 'Copyright Violation',
      misleading: 'Misleading Information',
      other: 'Other',
    };
    return labels[type] || type;
  };

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    reviewed: reports.filter(r => r.status === 'reviewed').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    dismissed: reports.filter(r => r.status === 'dismissed').length,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Flag className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Store Reports</h1>
          </div>
          <p className="text-muted-foreground">
            Review and manage customer reports about stores and products
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Reports</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.reviewed}</div>
            <div className="text-sm text-muted-foreground">Reviewed</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
            <div className="text-sm text-muted-foreground">Resolved</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-gray-600">{stats.dismissed}</div>
            <div className="text-sm text-muted-foreground">Dismissed</div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Filter by Status:</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reports</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={fetchReports} variant="outline" size="sm">
              Refresh
            </Button>
          </div>
        </Card>

        {/* Reports List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : reports.length === 0 ? (
          <Card className="p-12 text-center">
            <Flag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Reports Found</h3>
            <p className="text-muted-foreground">
              {statusFilter === 'all'
                ? 'No reports have been submitted yet.'
                : `No ${statusFilter} reports found.`}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <Card key={report.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">
                            {getReportTypeLabel(report.report_type)}
                          </h3>
                          {getStatusBadge(report.status)}
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Store className="w-4 h-4" />
                            <span className="font-medium">Store:</span>
                            <span>{report.stores.name}</span>
                          </div>

                          {report.products && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Package className="w-4 h-4" />
                              <span className="font-medium">Product:</span>
                              <span>{report.products.name}</span>
                            </div>
                          )}

                          {report.reporter_email && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="w-4 h-4" />
                              <span>{report.reporter_email}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {formatDistanceToNow(new Date(report.created_at), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                        </div>

                        <p className="mt-3 text-sm text-foreground line-clamp-2">
                          {report.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => handleViewDetails(report)}
                      size="sm"
                      className="whitespace-nowrap"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Report Details
            </DialogTitle>
            <DialogDescription>
              Review and take action on this report
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-6">
              {/* Report Info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Report Type</h4>
                  <Badge variant="outline">{getReportTypeLabel(selectedReport.report_type)}</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Status</h4>
                  {getStatusBadge(selectedReport.status)}
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Store</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <Store className="w-4 h-4" />
                    <a
                      href={`/${selectedReport.stores.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {selectedReport.stores.name}
                    </a>
                  </div>
                </div>

                {selectedReport.products && (
                  <div>
                    <h4 className="font-semibold mb-2">Product</h4>
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="w-4 h-4" />
                      <span>{selectedReport.products.name}</span>
                    </div>
                  </div>
                )}

                {selectedReport.reporter_email && (
                  <div>
                    <h4 className="font-semibold mb-2">Reporter Email</h4>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4" />
                      <a
                        href={`mailto:${selectedReport.reporter_email}`}
                        className="text-primary hover:underline"
                      >
                        {selectedReport.reporter_email}
                      </a>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold mb-2">Submitted</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(selectedReport.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <Card className="p-4 bg-muted/50">
                  <p className="text-sm whitespace-pre-wrap">{selectedReport.description}</p>
                </Card>
              </div>

              {/* Admin Notes */}
              <div>
                <h4 className="font-semibold mb-2">Admin Notes</h4>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about your investigation and actions taken..."
                  className="min-h-[100px]"
                />
              </div>

              {/* Previous Admin Notes */}
              {selectedReport.admin_notes && selectedReport.admin_notes !== adminNotes && (
                <div>
                  <h4 className="font-semibold mb-2">Previous Notes</h4>
                  <Card className="p-4 bg-muted/50">
                    <p className="text-sm whitespace-pre-wrap">{selectedReport.admin_notes}</p>
                  </Card>
                </div>
              )}

              {selectedReport.reviewed_at && (
                <div className="text-sm text-muted-foreground">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Last reviewed: {new Date(selectedReport.reviewed_at).toLocaleString()}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setDetailsOpen(false)}
              disabled={updating}
            >
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={() => handleUpdateStatus('dismissed')}
                disabled={updating || selectedReport?.status === 'dismissed'}
              >
                {updating ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <XCircle className="w-4 h-4 mr-2" />
                )}
                Dismiss
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleUpdateStatus('reviewed')}
                disabled={updating || selectedReport?.status === 'reviewed'}
              >
                {updating ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Eye className="w-4 h-4 mr-2" />
                )}
                Mark Reviewed
              </Button>
              <Button
                onClick={() => handleUpdateStatus('resolved')}
                disabled={updating || selectedReport?.status === 'resolved'}
              >
                {updating ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Resolve
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
