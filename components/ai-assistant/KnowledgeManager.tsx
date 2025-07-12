"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Download,
  BookOpen,
  Globe,
  Tag,
  Calendar,
  CheckCircle,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { knowledgeManager } from "@/lib/ai/knowledge-manager"

interface KnowledgeItem {
  id: string
  title: string
  content: string
  category: string
  language: string
  tags: string[]
  isVerified: boolean
  lastUpdated: Date
  createdBy?: string
  metadata?: Record<string, any>
}

interface KnowledgeManagerProps {
  isOpen: boolean
  onClose: () => void
}

export default function KnowledgeManager({ isOpen, onClose }: KnowledgeManagerProps) {
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([])
  const [filteredItems, setFilteredItems] = useState<KnowledgeItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all")
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const [languages, setLanguages] = useState<string[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("items")

  // Form state for creating/editing items
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    language: "arabic",
    tags: "",
    isVerified: false,
  })

  // Load initial data
  useEffect(() => {
    if (isOpen) {
      loadKnowledgeItems()
      loadCategories()
      loadLanguages()
      loadAnalytics()
    }
  }, [isOpen])

  // Filter items based on search and filters
  useEffect(() => {
    let filtered = knowledgeItems

    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category === selectedCategory)
    }

    if (selectedLanguage !== "all") {
      filtered = filtered.filter((item) => item.language === selectedLanguage)
    }

    if (showVerifiedOnly) {
      filtered = filtered.filter((item) => item.isVerified)
    }

    setFilteredItems(filtered)
  }, [knowledgeItems, searchQuery, selectedCategory, selectedLanguage, showVerifiedOnly])

  const loadKnowledgeItems = async () => {
    setIsLoading(true)
    try {
      const items = await knowledgeManager.getKnowledgeItems({ limit: 100 })
      setKnowledgeItems(items)
    } catch (error) {
      console.error("Error loading knowledge items:", error)
      toast.error("فشل في تحميل عناصر قاعدة المعرفة")
    } finally {
      setIsLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const cats = await knowledgeManager.getCategories()
      setCategories(cats)
    } catch (error) {
      console.error("Error loading categories:", error)
    }
  }

  const loadLanguages = async () => {
    try {
      const langs = await knowledgeManager.getLanguages()
      setLanguages(langs)
    } catch (error) {
      console.error("Error loading languages:", error)
    }
  }

  const loadAnalytics = async () => {
    try {
      const data = await knowledgeManager.getAnalytics()
      setAnalytics(data)
    } catch (error) {
      console.error("Error loading analytics:", error)
    }
  }

  const handleCreateItem = async () => {
    if (!formData.title || !formData.content || !formData.category) {
      toast.error("يرجى ملء جميع الحقول المطلوبة")
      return
    }

    try {
      const tags = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)

      const id = await knowledgeManager.createKnowledgeItem({
        title: formData.title,
        content: formData.content,
        category: formData.category,
        language: formData.language,
        tags,
        isVerified: formData.isVerified,
      })

      if (id) {
        toast.success("تم إنشاء العنصر بنجاح")
        setIsCreateDialogOpen(false)
        resetForm()
        loadKnowledgeItems()
        loadAnalytics()
      } else {
        toast.error("فشل في إنشاء العنصر")
      }
    } catch (error) {
      console.error("Error creating item:", error)
      toast.error("حدث خطأ أثناء إنشاء العنصر")
    }
  }

  const handleUpdateItem = async () => {
    if (!editingItem || !formData.title || !formData.content || !formData.category) {
      toast.error("يرجى ملء جميع الحقول المطلوبة")
      return
    }

    try {
      const tags = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)

      const success = await knowledgeManager.updateKnowledgeItem(editingItem.id, {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        language: formData.language,
        tags,
        isVerified: formData.isVerified,
      })

      if (success) {
        toast.success("تم تحديث العنصر بنجاح")
        setEditingItem(null)
        resetForm()
        loadKnowledgeItems()
        loadAnalytics()
      } else {
        toast.error("فشل في تحديث العنصر")
      }
    } catch (error) {
      console.error("Error updating item:", error)
      toast.error("حدث خطأ أثناء تحديث العنصر")
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا العنصر؟")) return

    try {
      const success = await knowledgeManager.deleteKnowledgeItem(id)
      if (success) {
        toast.success("تم حذف العنصر بنجاح")
        loadKnowledgeItems()
        loadAnalytics()
      } else {
        toast.error("فشل في حذف العنصر")
      }
    } catch (error) {
      console.error("Error deleting item:", error)
      toast.error("حدث خطأ أثناء حذف العنصر")
    }
  }

  const handleVerifyItem = async (id: string, verified: boolean) => {
    try {
      const success = await knowledgeManager.verifyKnowledgeItem(id, verified)
      if (success) {
        toast.success(verified ? "تم التحقق من العنصر" : "تم إلغاء التحقق من العنصر")
        loadKnowledgeItems()
        loadAnalytics()
      } else {
        toast.error("فشل في تحديث حالة التحقق")
      }
    } catch (error) {
      console.error("Error verifying item:", error)
      toast.error("حدث خطأ أثناء تحديث حالة التحقق")
    }
  }

  const handleExport = async () => {
    try {
      const items = await knowledgeManager.exportKnowledge()
      const dataStr = JSON.stringify(items, null, 2)
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

      const exportFileDefaultName = `knowledge-base-${new Date().toISOString().split("T")[0]}.json`

      const linkElement = document.createElement("a")
      linkElement.setAttribute("href", dataUri)
      linkElement.setAttribute("download", exportFileDefaultName)
      linkElement.click()

      toast.success("تم تصدير قاعدة المعرفة بنجاح")
    } catch (error) {
      console.error("Error exporting knowledge base:", error)
      toast.error("فشل في تصدير قاعدة المعرفة")
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      category: "",
      language: "arabic",
      tags: "",
      isVerified: false,
    })
  }

  const startEdit = (item: KnowledgeItem) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      content: item.content,
      category: item.category,
      language: item.language,
      tags: item.tags.join(", "),
      isVerified: item.isVerified,
    })
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            إدارة قاعدة المعرفة
          </DialogTitle>
          <DialogDescription>إدارة وتنظيم محتوى قاعدة المعرفة للمساعد الذكي</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="items">العناصر</TabsTrigger>
            <TabsTrigger value="analytics">التحليلات</TabsTrigger>
            <TabsTrigger value="settings">الإعدادات</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="البحث في قاعدة المعرفة..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الفئات</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="اللغة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع اللغات</SelectItem>
                  {languages.map((language) => (
                    <SelectItem key={language} value={language}>
                      {language}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2">
                <Switch id="verified-only" checked={showVerifiedOnly} onCheckedChange={setShowVerifiedOnly} />
                <Label htmlFor="verified-only">المحقق فقط</Label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  إضافة عنصر جديد
                </Button>
                <Button variant="outline" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  تصدير
                </Button>
              </div>

              <div className="text-sm text-gray-500">
                {filteredItems.length} من {knowledgeItems.length} عنصر
              </div>
            </div>

            {/* Knowledge Items List */}
            <div className="max-h-96 overflow-y-auto space-y-3">
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="mr-2">جاري التحميل...</span>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">لا توجد عناصر تطابق البحث</div>
              ) : (
                <AnimatePresence>
                  {filteredItems.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Card>
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <CardTitle className="text-lg flex items-center gap-2">
                                {item.title}
                                {item.isVerified && <CheckCircle className="w-4 h-4 text-green-500" />}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-4 mt-1">
                                <span className="flex items-center gap-1">
                                  <Tag className="w-3 h-3" />
                                  {item.category}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Globe className="w-3 h-3" />
                                  {item.language}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {item.lastUpdated.toLocaleDateString("ar-SA")}
                                </span>
                              </CardDescription>
                            </div>
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" onClick={() => startEdit(item)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleVerifyItem(item.id, !item.isVerified)}
                              >
                                {item.isVerified ? (
                                  <X className="w-4 h-4 text-red-500" />
                                ) : (
                                  <Check className="w-4 h-4 text-green-500" />
                                )}
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDeleteItem(item.id)}>
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.content}</p>
                          {item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {item.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            {analytics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">إجمالي العناصر</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.totalItems}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">العناصر المحققة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{analytics.verifiedItems}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">الفئات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{Object.keys(analytics.categoryCounts).length}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">اللغات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{Object.keys(analytics.languageCounts).length}</div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات قاعدة المعرفة</CardTitle>
                <CardDescription>إعدادات عامة لإدارة قاعدة المعرفة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>التحقق التلقائي</Label>
                    <p className="text-sm text-gray-500">تحقق تلقائياً من العناصر الجديدة</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>النسخ الاحتياطي التلقائي</Label>
                    <p className="text-sm text-gray-500">إنشاء نسخة احتياطية يومياً</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create/Edit Dialog */}
        <Dialog
          open={isCreateDialogOpen || !!editingItem}
          onOpenChange={(open) => {
            if (!open) {
              setIsCreateDialogOpen(false)
              setEditingItem(null)
              resetForm()
            }
          }}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingItem ? "تعديل العنصر" : "إضافة عنصر جديد"}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="title">العنوان *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="عنوان العنصر"
                />
              </div>

              <div>
                <Label htmlFor="content">المحتوى *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="محتوى العنصر"
                  rows={6}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">الفئة *</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="فئة العنصر"
                  />
                </div>

                <div>
                  <Label htmlFor="language">اللغة</Label>
                  <Select
                    value={formData.language}
                    onValueChange={(value) => setFormData({ ...formData, language: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="arabic">العربية</SelectItem>
                      <SelectItem value="english">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="tags">العلامات</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="علامة1, علامة2, علامة3"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="verified"
                  checked={formData.isVerified}
                  onCheckedChange={(checked) => setFormData({ ...formData, isVerified: checked })}
                />
                <Label htmlFor="verified">محقق</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false)
                    setEditingItem(null)
                    resetForm()
                  }}
                >
                  إلغاء
                </Button>
                <Button onClick={editingItem ? handleUpdateItem : handleCreateItem}>
                  {editingItem ? "تحديث" : "إنشاء"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  )
}
