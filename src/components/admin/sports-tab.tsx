import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { EditIcon, DeleteIcon, AddIcon } from "@/utils/iconMapping";
import { sports } from "@/data/mockData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SportsTab() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableCaption>List of all sports</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sports.map((sport) => (
            <TableRow key={sport.id}>
              <TableCell className="font-medium">{sport.name}</TableCell>
              <TableCell>{sport.description}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon">
                  <EditIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive">
                  <DeleteIcon className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Form Components
function SportForm() {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Sport Name</Label>
        <Input id="name" placeholder="Enter sport name" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" placeholder="Enter sport description" />
      </div>
      <div className="pt-4">
        <Button className="w-full">Add Sport</Button>
      </div>
    </div>
  );
}
