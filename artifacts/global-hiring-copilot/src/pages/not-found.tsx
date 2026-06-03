import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="bg-primary/10 p-6 rounded-full text-primary mb-6">
        <Search className="w-12 h-12" />
      </div>
      <h1 className="text-4xl font-bold font-display text-foreground mb-4">Page not found</h1>
      <p className="text-muted-foreground text-lg mb-8 max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link href="/">
        <Button size="lg" className="font-medium">
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
}
