"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2, Check, Download, Filter, BookOpen, Shield, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { knowledgeManager } from "@/lib/ai/knowledge-manager"

interface KnowledgeItem {
  id: string
  title: string
  content: string
  category: string
  language: string
  verified: boolean
  lastUpdated: Date
  metadata?: Record<string, any>
}

interface KnowledgeManagerProps {
  isOpen: boolean
  onClose: () => void
}

export default function KnowledgeManager({ isOpen, onClose }: KnowledgeManagerProps) {
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all")
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [analytics, setAnalytics] = useState<any>(null)

  // Form state for adding/editing items
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    language: "arabic",
    verified: false,
  })

  // Load knowledge items
  const loadKnowledgeItems = async () => {
    setIsLoading(true)
    try {
      const { items } = await knowledgeManager.getKnowledgeItems({
        category: selectedCategory === "all" ? undefined : selectedCategory,
        language: selectedLanguage === "all" ? undefined : selectedLanguage,
        verified: showVerifiedOnly ? true : undefined,
      })
      setKnowledgeItems(items)
    } catch (error) {
      console.error("Error loading knowledge items:", error)
      toast.error("فشل في تحميل قاعدة المعرفة")
    } finally {
      setIsLoading(false)
    }
  }

  // Load categories
  const loadCategories = async () => {
    try {
      const cats = await knowledgeManager.getCategories()
      setCategories(cats)
    } catch (error) {
      console.error("Error loading categories:", error)
    }
  }

  // Load analytics
  const loadAnalytics = async () => {
    try {
      const data = await knowledgeManager.getKnowledgeAnalytics()
      setAnalytics(data)
    } catch (error) {
      console.error("Error loading analytics:", error)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadKnowledgeItems()
      loadCategories()
      loadAnalytics()
    }
  }, [isOpen, selectedCategory, selectedLanguage, showVerifiedOnly])

  // Handle add/edit item
  const handleSaveItem = async () => {
    if (!formData.title || !formData.content || !formData.category) {
      toast.error("يرجى ملء جميع الحقول المطلوبة")
      return
    }

    try {
      if (editingItem) {
        // Update existing item
        const success = await knowledgeManager.updateKnowledgeItem(editingItem.id, formData)
        if (success) {
          toast.success("تم تحديث العنصر بنجاح")
          setEditingItem(null)
        } else {
          toast.error("فشل في تحديث العنصر")
        }
      } else {
        // Add new item
        const id = await knowledgeManager.addKnowledgeItem(formData)
        if (id) {
          toast.success("تم إضافة العنصر بنجاح")
          setShowAddDialog(false)
        } else {
          toast.error("فشل في إضافة العنصر")
        }
      }

      // Reset form
      setFormData({
        title: "",
        content: "",
        category: "",
        language: "arabic",
        verified: false,
      })

      // Reload data
      loadKnowledgeItems()
      loadAnalytics()
    } catch (error) {
      console.error("Error saving item:", error)
      toast.error("حدث خطأ أثناء الحفظ")
    }
  }

  // Handle delete item
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
      toast.error("حدث خطأ أثناء الحذف")
    }
  }

  // Handle verify item
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
      toast.error("حدث خطأ أثناء التحديث")
    }
  }

  // Handle export
  const handleExport = async () => {
    try {
      const items = await knowledgeManager.exportKnowledge({
        category: selectedCategory === "all" ? undefined : selectedCategory,
        language: selectedLanguage === "all" ? undefined : selectedLanguage,
        verified: showVerifiedOnly ? true : undefined,
      })

      const dataStr = JSON.stringify(items, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `knowledge-base-${new Date().toISOString().split("T")[0]}.json`
      link.click()
      URL.revokeObjectURL(url)

      toast.success("تم تصدير قاعدة المعرفة بنجاح")
    } catch (error) {
      console.error("Error exporting knowledge:", error)
      toast.error("فشل في تصدير قاعدة المعرفة")
    }
  }

  // Filter items based on search
  const filteredItems = knowledgeItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            إدارة قاعدة المعرفة
          </DialogTitle>
          <DialogDescription>إدارة وتحديث المعلومات المتاحة للمساعد الذكي</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="items" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="items">العناصر</TabsTrigger>
            <TabsTrigger value="analytics">التحليلات</TabsTrigger>
            <TabsTrigger value="settings">الإعدادات</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="space-y-4">
            {/* Controls */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-2 items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="البحث في قاعدة المعرفة..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="الفئة" />
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
                    <SelectItem value="arabic">العربية</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center space-x-2">
                  <Switch id="verified-only" checked={showVerifiedOnly} onCheckedChange={setShowVerifiedOnly} />
                  <Label htmlFor="verified-only">المحقق فقط</Label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowAddDialog(true)} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  إضافة عنصر
                </Button>
                <Button variant="outline" onClick={handleExport} className="flex items-center gap-2 bg-transparent">
                  <Download className="w-4 h-4" />
                  تصدير
                </Button>
              </div>
            </div>

            {/* Items List */}
            <div className="max-h-96 overflow-y-auto space-y-2">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">جاري التحميل...</p>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">لا توجد عناصر في قاعدة المعرفة</p>
                </div>
              ) : (
                filteredItems.map((item) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{item.title}</h4>
                          <Badge variant={item.verified ? "default" : "secondary"}>
                            {item.verified ? "محقق" : "غير محقق"}
                          </Badge>
                          <Badge variant="outline">{item.category}</Badge>
                          <Badge variant="outline">{item.language}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.content}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          آخر تحديث: {new Date(item.lastUpdated).toLocaleDateString("ar-SA")}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleVerifyItem(item.id, !item.verified)}
                          className="text-green-600 hover:text-green-700"
                        >
                          {item.verified ? <Shield className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingItem(item)
                            setFormData({
                              title: item.title,
                              content: item.content,
                              category: item.category,
                              language: item.language,
                              verified: item.verified,
                            })
                          }}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            {analytics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">إجمالي العناصر</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.totalItems}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">العناصر المحققة</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.verifiedItems}</div>
                    <p className="text-xs text-muted-foreground">
                      {analytics.totalItems > 0
                        ? Math.round((analytics.verifiedItems / analytics.totalItems) * 100)
                        : 0}
                      % من المجموع
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">الفئات</CardTitle>
                    <Filter className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{Object.keys(analytics.categoryCounts).length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">محدث مؤخراً</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.recentlyUpdated}</div>
                    <p className="text-xs text-muted-foreground">آخر 7 أيام</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات قاعدة المعرفة</CardTitle>
                <CardDescription>تكوين إعدادات إدارة المعرفة</CardDescription>
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
                    <p className="text-sm text-gray-500">إنشاء نسخ احتياطية يومية</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add/Edit Dialog */}
        <Dialog
          open={showAddDialog || editingItem !== null}
          onOpenChange={() => {
            setShowAddDialog(false)
            setEditingItem(null)
            setFormData({
              title: "",
              content: "",
              category: "",
              language: "arabic",
              verified: false,
            })
          }}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingItem ? "تحرير العنصر" : "إضافة عنصر جديد"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">العنوان</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="عنوان العنصر"
                />
              </div>
              <div>
                <Label htmlFor="category">الفئة</Label>
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
              <div>
                <Label htmlFor="content">المحتوى</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="محتوى العنصر"
                  rows={6}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="verified"
                  checked={formData.verified}
                  onCheckedChange={(checked) => setFormData({ ...formData, verified: checked })}
                />
                <Label htmlFor="verified">محقق</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddDialog(false)
                    setEditingItem(null)
                  }}
                >
                  إلغاء
                </Button>
                <Button onClick={handleSaveItem}>{editingItem ? "تحديث" : "إضافة"}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  )
}
