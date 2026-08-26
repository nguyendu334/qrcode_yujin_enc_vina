import { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { toast } from "react-toastify";

import HeaderSection from "../../../components/category/HeaderSection";
import TemplateFilter from "../../../components/category/TemplateFilter";
import ItemTable from "../../../components/category/ItemTable";
import ItemModal from "../../../components/category/Modal";
import api from "../../../helper/api";

export default function ChecklistItemManager() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [items, setItems] = useState([]);

  // Modal State
  const [openModal, setOpenModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    item_name: "",
    item_type: "OKNG",
    standard_value: "",
    unit: "",
    min_value: "",
    max_value: "",
    display_order: 1,
  });

  // Load Danh sách Templates
  useEffect(() => {
    api.get("/checklist-templates").then((res) => {
      const data = res.data.data || res.data;
      setTemplates(data);
      if (data.length > 0) {
        setSelectedTemplateId(data[0].template_id);
      }
    });
  }, []);

  // Load Hạng mục khi chọn Template
  useEffect(() => {
    if (selectedTemplateId) {
      loadTemplateItems(selectedTemplateId);
    }
  }, [selectedTemplateId]);

  const loadTemplateItems = (templateId) => {
    api.get(`/checklist-items/template/${templateId}`).then((res) => {
      setItems(res.data.data || []);
    });
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    const maxOrder =
      items.length > 0
        ? Math.max(...items.map((item) => Number(item.display_order) || 0))
        : 0;

    setFormData({
      item_name: "",
      item_type: "OKNG",
      standard_value: "",
      unit: "",
      min_value: "",
      max_value: "",
      display_order: maxOrder + 1,
    });
    setOpenModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      item_name: item.item_name || "",
      item_type: item.item_type || "OKNG",
      standard_value: item.standard_value || "",
      unit: item.unit || "",
      min_value: item.min_value !== null ? item.min_value : "",
      max_value: item.max_value !== null ? item.max_value : "",
      display_order: item.display_order || 1,
    });
    setOpenModal(true);
  };

  const handleSave = async () => {
    if (!formData.item_name) {
      alert("Vui lòng nhập tên hạng mục!");
      return;
    }

    if (editingItem) {
      await api.put(`/checklist-items/${editingItem.item_id}`, formData);
    } else {
      await api.post("/checklist-items", {
        ...formData,
        template_id: selectedTemplateId,
      });
    }

    setOpenModal(false);
    loadTemplateItems(selectedTemplateId);
    toast.success("Done!")
  };

  const handleDelete = async (itemId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hạng mục này?")) {
      await api.delete(`/checklist-items/${itemId}`);
      loadTemplateItems(selectedTemplateId);
      toast.success("Đã xoá thành công")
    }
  };

  return (
    <Box sx={{ p: 4, backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <HeaderSection onOpenAdd={handleOpenAdd} disabled={!selectedTemplateId} />

      <TemplateFilter
        templates={templates}
        selectedTemplateId={selectedTemplateId}
        onChange={setSelectedTemplateId}
      />

      <ItemTable
        items={items}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />

      <ItemModal
        open={openModal}
        isEditing={Boolean(editingItem)}
        formData={formData}
        setFormData={setFormData}
        onClose={() => setOpenModal(false)}
        onSave={handleSave}
      />
    </Box>
  );
}
