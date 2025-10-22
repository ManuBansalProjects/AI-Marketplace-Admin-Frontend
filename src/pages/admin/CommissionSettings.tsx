import { useEffect, useState } from "react";
// import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Percent } from "lucide-react";

interface CommissionSetting {
  id: string;
  setting_name: string;
  commission_rate: number;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

const CommissionSettings = () => {
  const [settings, setSettings] = useState<CommissionSetting[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<CommissionSetting | null>(null);
  const [formData, setFormData] = useState({
    setting_name: "",
    commission_rate: "",
    description: "",
    is_active: true,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    // const { data } = await supabase
    //   .from("commission_settings")
    //   .select("*")
    //   .order("created_at", { ascending: false });

    // if (data) setSettings(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // try {
    //   if (editingSetting) {
    //     const { error } = await supabase
    //       .from("commission_settings")
    //       .update({
    //         setting_name: formData.setting_name,
    //         commission_rate: Number(formData.commission_rate),
    //         description: formData.description,
    //         is_active: formData.is_active,
    //       })
    //       .eq("id", editingSetting.id);

    //     if (error) throw error;
    //     toast.success("Commission setting updated!");
    //   } else {
    //     const { error } = await supabase
    //       .from("commission_settings")
    //       .insert({
    //         setting_name: formData.setting_name,
    //         commission_rate: Number(formData.commission_rate),
    //         description: formData.description,
    //         is_active: formData.is_active,
    //       });

    //     if (error) throw error;
    //     toast.success("Commission setting created!");
    //   }

    //   setIsDialogOpen(false);
    //   resetForm();
    //   fetchSettings();
    // } catch (error: any) {
    //   toast.error(error.message);
    // }
  };

  const handleEdit = (setting: CommissionSetting) => {
    setEditingSetting(setting);
    setFormData({
      setting_name: setting.setting_name,
      commission_rate: setting.commission_rate.toString(),
      description: setting.description || "",
      is_active: setting.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this setting?")) return;

    // try {
    //   const { error } = await supabase
    //     .from("commission_settings")
    //     .delete()
    //     .eq("id", id);

    //   if (error) throw error;
    //   toast.success("Setting deleted!");
    //   fetchSettings();
    // } catch (error: any) {
    //   toast.error(error.message);
    // }
  };

  const resetForm = () => {
    setFormData({
      setting_name: "",
      commission_rate: "",
      description: "",
      is_active: true,
    });
    setEditingSetting(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Commission Settings</h1>
          <p className="text-muted-foreground">Configure platform commission rates</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Setting
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSetting ? "Edit Commission Setting" : "Create Commission Setting"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="setting_name">Setting Name</Label>
                <Input
                  id="setting_name"
                  value={formData.setting_name}
                  onChange={(e) => setFormData({ ...formData, setting_name: e.target.value })}
                  required
                  placeholder="e.g., Premium, Standard"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="commission_rate">Commission Rate (%)</Label>
                <Input
                  id="commission_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.commission_rate}
                  onChange={(e) => setFormData({ ...formData, commission_rate: e.target.value })}
                  required
                  placeholder="10.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              <Button type="submit" className="w-full">
                {editingSetting ? "Update Setting" : "Create Setting"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Commission Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Setting Name</TableHead>
                  <TableHead>Commission Rate</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settings.map((setting) => (
                  <TableRow key={setting.id}>
                    <TableCell className="font-medium">{setting.setting_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Percent className="h-4 w-4" />
                        {setting.commission_rate}%
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{setting.description || "-"}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        setting.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                      }`}>
                        {setting.is_active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(setting.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(setting)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(setting.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommissionSettings;