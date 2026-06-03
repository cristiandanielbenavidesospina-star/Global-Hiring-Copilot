import { useListHiringHistory, getListHiringHistoryQueryKey, useDeleteHiringReport } from "@workspace/api-client-react";
import { Link } from "wouter";
import { useState } from "react";
import { format } from "date-fns";
import { Trash2, FileText, ArrowRight, MapPin, Building2, Briefcase, Search } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export default function History() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useListHiringHistory(
    { page, limit },
    {
      query: {
        queryKey: getListHiringHistoryQueryKey({ page, limit }),
      }
    }
  );

  const deleteReport = useDeleteHiringReport();

  const handleDelete = () => {
    if (!deleteId) return;
    
    deleteReport.mutate(
      { id: deleteId },
      {
        onSuccess: () => {
          toast({ title: "Report deleted successfully" });
          queryClient.invalidateQueries({ queryKey: getListHiringHistoryQueryKey({ page, limit }) });
          setDeleteId(null);
        },
        onError: () => {
          toast({ 
            title: "Failed to delete report", 
            description: "Please try again later.",
            variant: "destructive" 
          });
          setDeleteId(null);
        }
      }
    );
  };

  const riskColors = {
    low: "bg-green-100 text-green-800 border-green-200",
    medium: "bg-amber-100 text-amber-800 border-amber-200",
    high: "bg-red-100 text-red-800 border-red-200",
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2 mb-8">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-5 w-96" />
        </div>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const reports = data?.reports || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold font-display tracking-tight text-foreground mb-2">History</h1>
        <p className="text-muted-foreground text-lg">Review and manage your past hiring analyses.</p>
      </div>

      {reports.length === 0 ? (
        <Card className="border-dashed border-2 bg-slate-50/50 shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <Search className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold font-display text-foreground mb-2">No analyses found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-6">
              You haven't run any global hiring checks yet. Start your first analysis from the dashboard.
            </p>
            <Link href="/">
              <Button size="lg"><ArrowRight className="w-4 h-4 mr-2" /> Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {reports.map((report) => (
              <Card key={report.id} className="overflow-hidden hover:shadow-md transition-shadow border-border/60" data-testid={`history-item-${report.id}`}>
                <div className="flex flex-col sm:flex-row sm:items-center p-5 gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold font-display text-foreground truncate">
                        {report.country}
                      </h3>
                      <Badge variant="outline" className={`px-2 py-0.5 text-xs font-semibold uppercase ${riskColors[report.riskAssessment]}`}>
                        {report.riskAssessment}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[200px]">{report.role}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5" />
                        <span className="capitalize">{report.companySize}</span>
                      </div>
                      <div className="text-xs text-muted-foreground/70 ml-auto sm:ml-0 flex items-center">
                        {format(new Date(report.createdAt), "MMM d, yyyy")}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-4 sm:mt-0 sm:pl-4 sm:border-l sm:border-border/50">
                    <Link href={`/report/${report.id}`}>
                      <Button variant="outline" className="w-full sm:w-auto" data-testid={`btn-view-${report.id}`}>
                        <FileText className="w-4 h-4 mr-2" /> View Report
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteId(report.id)}
                      data-testid={`btn-delete-${report.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <Button 
                      variant="ghost" 
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                    >
                      <PaginationPrevious className="mr-2" /> Previous
                    </Button>
                  </PaginationItem>
                  <PaginationItem className="px-4 text-sm font-medium">
                    Page {page} of {totalPages}
                  </PaginationItem>
                  <PaginationItem>
                    <Button 
                      variant="ghost" 
                      disabled={page >= totalPages}
                      onClick={() => setPage(p => p + 1)}
                    >
                      Next <PaginationNext className="ml-2" />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the hiring report from your history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteReport.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
