"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Search, Download, Upload, CheckCircle, AlertCircle, Save, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { knowledgeManager, type KnowledgeItem } from "@/lib/ai/knowledge-manager"
import { groqAI } from "@/lib/ai/groq-service"

interface KnowledgeManagerProps {
  isOpen: boolean
  onClose: () => void
}

export default function KnowledgeManager({ isOpen, onClose }: KnowledgeManagerProps) {
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([])
  const [filteredItems, setFilteredItems] = useState<KnowledgeItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(false)
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [systemInstructions, setSystemInstructions] = useState("")
  const [analytics, setAnalytics] = useState({
    totalItems: 0,
    verifiedItems: 0,
    categoriesCount: {} as Record<string, number>,
    recentUpdates: 0,
  })

  // Form state for adding/editing items
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    subcategory: "",
    keywords: "",
    verified: false,
  })

  useEffect(() => {
    if (isOpen) {
      loadKnowledgeItems()
      loadSystemInstructions()
      loadAnalytics()
    }
  }, [isOpen])

  useEffect(() => {
    filterItems()
  }, [knowledgeItems, searchQuery, selectedCategory])

  const loadKnowledgeItems = async () => {
    setIsLoading(true)
    try {
      const items = await knowledgeManager.getKnowledgeItems()
      setKnowledgeItems(items)
    } catch (error) {
      console.error("Error loading knowledge items:", error)
      toast.error("فشل في تحميل قاعدة المعرفة")
    } finally {
      setIsLoading(false)
    }
  }

  const loadSystemInstructions = async () => {
    try {
      const instructions = groqAI.getSystemInstructions()
      setSystemInstructions(instructions)
    } catch (error) {
      console.error("Error loading system instructions:", error)
    }
  }

  const loadAnalytics = async () => {
    try {
      const analyticsData = await knowledgeManager.getKnowledgeAnalytics()
      setAnalytics(analyticsData)
    } catch (error) {
      console.error("Error loading analytics:", error)
    }
  }

  const filterItems = () => {
    let filtered = knowledgeItems

    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.keywords.some((keyword) => keyword.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category === selectedCategory)
    }

    setFilteredItems(filtered)
  }

  const handleSaveItem = async () => {
    if (!formData.title || !formData.content || !formData.category) {
      toast.error("يرجى ملء جميع الحقول المطلوبة")
      return
    }

    setIsLoading(true)
    try {
      const validation = await knowledgeManager.validateKnowledgeItem({
        ...formData,
        keywords: formData.keywords
          .split(",")
          .map((k) => k.trim())
          .filter((k) => k),
      })

      if (!validation.valid) {
        toast.error(`خطأ في البيانات: ${validation.errors.join(", ")}`)
        return
      }

      if (validation.warnings.length > 0) {
        toast.warning(`تحذيرات: ${validation.warnings.join(", ")}`)
      }

      let success = false

      if (editingItem) {
        success = await knowledgeManager.updateKnowledgeItem(editingItem.id, {
          ...formData,
          keywords: formData.keywords
            .split(",")
            .map((k) => k.trim())
            .filter((k) => k),
        })
      } else {
        const id = await knowledgeManager.addKnowledgeItem({
          ...formData,
          keywords: formData.keywords
            .split(",")
            .map((k) => k.trim())
            .filter((k) => k),
          language: "arabic",
        })
        success = !!id
      }

      if (success) {
        toast.success(editingItem ? "تم تحديث العنصر بنجاح" : "تم إضافة العنصر بنجاح")
        await loadKnowledgeItems()
        resetForm()
      } else {
        toast.error("فشل في حفظ العنصر")
      }
    } catch (error) {
      console.error("Error saving item:", error)
      toast.error("حدث خطأ أثناء الحفظ")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا العنصر؟")) return

    setIsLoading(true)
    try {
      const success = await knowledgeManager.deleteKnowledgeItem(id)
      if (success) {
        toast.success("تم حذف العنصر بنجاح")
        await loadKnowledgeItems()
      } else {
        toast.error("فشل في حذف العنصر")
      }
    } catch (error) {
      console.error("Error deleting item:", error)
      toast.error("حدث خطأ أثناء الحذف")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditItem = (item: KnowledgeItem) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      content: item.content,
      category: item.category,
      subcategory: item.subcategory || "",
      keywords: item.keywords.join(", "),
      verified: item.verified,
    })
    setIsAddingNew(true)
  }

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      category: "",
      subcategory: "",
      keywords: "",
      verified: false,
    })
    setEditingItem(null)
    setIsAddingNew(false)
  }

  const handleUpdateSystemInstructions = async () => {
    setIsLoading(true)
    try {
      const success = groqAI.updateSystemInstructions(systemInstructions)
      if (success) {
        toast.success("تم تحديث تعليمات النظام بنجاح")
      } else {
        toast.error("فشل في تحديث التعليمات - تأكد من وجود الإرشادات الأساسية")
      }
    } catch (error) {
      console.error("Error updating system instructions:", error)
      toast.error("حدث خطأ أثناء التحديث")
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportKnowledge = async () => {
    try {
      const exportData = await knowledgeManager.exportKnowledgeBase()
      const blob = new Blob([exportData], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `knowledge-base-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success("تم تصدير قاعدة المعرفة بنجاح")
    } catch (error) {
      console.error("Error exporting knowledge base:", error)
      toast.error("فشل في تصدير قاعدة المعرفة")
    }
  }

  const handleImportKnowledge = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const result = await knowledgeManager.importKnowledgeBase(text)

      if (result.success) {
        toast.success(`تم استيراد ${result.imported} عنصر بنجاح`)
        await loadKnowledgeItems()
      } else {
        toast.error("فشل في الاستيراد")
      }

      if (result.errors.length > 0) {
        console.error("Import errors:", result.errors)
      }
    } catch (error) {
      console.error("Error importing knowledge base:", error)
      toast.error("فشل في قراءة الملف")
    }

    // Reset file input
    event.target.value = ""
  }

  const categories = Array.from(new Set(knowledgeItems.map((item) => item.category)))

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Settings className="w-5 h-5" />
            إدارة قاعدة المعرفة والذكاء الاصطناعي
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="knowledge" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="knowledge" className="text-gray-300 data-[state=active]:text-white">
              قاعدة المعرفة
            </TabsTrigger>
            <TabsTrigger value="instructions" className="text-gray-300 data-[state=active]:text-white">
              تعليمات النظام
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-gray-300 data-[state=active]:text-white">
              التحليلات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="knowledge" className="space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Controls */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="البحث في قاعدة المعرفة..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40 bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="الفئة" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all">جميع الفئات</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => setIsAddingNew(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  إضافة عنصر
                </Button>
                <Button
                  onClick={handleExportKnowledge}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                >
                  <Download className="w-4 h-4 mr-2" />
                  تصدير
                </Button>
                <label className="cursor-pointer">
                  <Button
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                    asChild
                  >
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      استيراد
                    </span>
                  </Button>
                  <input type="file" accept=".json" onChange={handleImportKnowledge} className="hidden" />
                </label>
              </div>
            </div>

            {/* Knowledge Items */}
            <div className="grid gap-4">
              {filteredItems.map((item) => (
                <Card key={item.id} className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-white text-lg">{item.title}</CardTitle>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                            {item.category}
                          </Badge>
                          {item.subcategory && (
                            <Badge variant="outline" className="border-gray-600 text-gray-400">
                              {item.subcategory}
                            </Badge>
                          )}
                          {item.verified ? (
                            <Badge className="bg-green-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              مؤكد
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              غير مؤكد
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditItem(item)}
                          className="text-gray-400 hover:text-white hover:bg-gray-700"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-gray-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 text-sm line-clamp-3">{item.content}</p>
                    {item.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {item.keywords.map((keyword, index) => (
                          <Badge key={index} variant="outline" className="text-xs border-gray-600 text-gray-400">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredItems.length === 0 && !isLoading && (
              <div className="text-center py-8 text-gray-400">لا توجد عناصر تطابق البحث</div>
            )}
          </TabsContent>

          <TabsContent value="instructions" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">تعليمات النظام</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={systemInstructions}
                  onChange={(e) => setSystemInstructions(e.target.value)}
                  rows={15}
                  className="bg-gray-900 border-gray-600 text-white font-mono text-sm"
                  placeholder="أدخل تعليمات النظام للذكاء الاصطناعي..."
                />
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-400">تأكد من تضمين الإرشادات الأساسية للأمان والدقة</div>
                  <Button
                    onClick={handleUpdateSystemInstructions}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    حفظ التعليمات
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-white">{analytics.totalItems}</div>
                  <p className="text-gray-400">إجمالي العناصر</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-green-400">{analytics.verifiedItems}</div>
                  <p className="text-gray-400">عناصر مؤكدة</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-blue-400">
                    {Object.keys(analytics.categoriesCount).length}
                  </div>
                  <p className="text-gray-400">الفئات</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-yellow-400">{analytics.recentUpdates}</div>
                  <p className="text-gray-400">تحديثات حديثة</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">توزيع الفئات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.categoriesCount).map(([category, count]) => (
                    <div key={category} className="flex justify-between items-center">
                      <span className="text-gray-300">{category}</span>
                      <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                        {count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add/Edit Dialog */}
        <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
          <DialogContent className="max-w-2xl bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">{editingItem ? "تعديل العنصر" : "إضافة عنصر جديد"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="text-sm font-medium text-gray-300">العنوان *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="عنوان العنصر"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">الفئة *</label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="مثل: services, pricing, technical"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">الفئة الفرعية</label>
                <Input
                  value={formData.subcategory}
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="فئة فرعية اختيارية"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">المحتوى *</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={8}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="محتوى العنصر - كن دقيقاً ولا تذكر أسعار محددة"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">الكلمات المفتاحية</label>
                <Input
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="كلمة1, كلمة2, كلمة3"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="verified"
                  checked={formData.verified}
                  onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="verified" className="text-sm text-gray-300">
                  معلومات مؤكدة ودقيقة
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={resetForm}
                className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
              >
                إلغاء
              </Button>
              <Button onClick={handleSaveItem} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                {editingItem ? "تحديث" : "إضافة"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  )
}
