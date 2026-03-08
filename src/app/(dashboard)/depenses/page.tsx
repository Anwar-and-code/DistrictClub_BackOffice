"use client"

import { useEffect, useState } from "react"
import { Wallet, Plus, Pencil, Trash2, X, Calendar, Filter, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { TableSkeleton } from "@/components/ui/loading"

interface ExpenseType {
  id: number
  name: string
  description: string | null
  is_active: boolean
}

interface Expense {
  id: number
  expense_type_id: number | null
  amount: number
  description: string | null
  expense_date: string
  created_by: string | null
  created_at: string
  expense_type?: ExpenseType
}

export default function DepensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [modal, setModal] = useState<{ type: 'create' | 'edit'; expense?: Expense } | null>(null)
  const [deleteModal, setDeleteModal] = useState<Expense | null>(null)
  const [typeModal, setTypeModal] = useState<{ type: 'create' | 'edit'; expenseType?: ExpenseType } | null>(null)
  const [formData, setFormData] = useState({
    expense_type_id: "",
    amount: "",
    description: "",
    expense_date: new Date().toISOString().split('T')[0],
  })
  const [typeFormData, setTypeFormData] = useState({ name: "", description: "" })
  const [deleteTypeModal, setDeleteTypeModal] = useState<ExpenseType | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [filterType, setFilterType] = useState("")
  const [filterMonth, setFilterMonth] = useState("")
  const supabase = createClient()

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [expensesRes, typesRes] = await Promise.all([
        supabase
          .from('expenses')
          .select('*, expense_type:expense_types(*)')
          .order('expense_date', { ascending: false }),
        supabase
          .from('expense_types')
          .select('*')
          .eq('is_active', true)
          .order('name', { ascending: true })
      ])

      if (expensesRes.error) throw expensesRes.error
      if (typesRes.error) throw typesRes.error

      setExpenses(expensesRes.data || [])
      setExpenseTypes(typesRes.data || [])
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors du chargement")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const openModal = (type: 'create' | 'edit', expense?: Expense) => {
    if (type === 'edit' && expense) {
      setFormData({
        expense_type_id: expense.expense_type_id?.toString() || "",
        amount: expense.amount.toString(),
        description: expense.description || "",
        expense_date: expense.expense_date,
      })
    } else {
      setFormData({
        expense_type_id: "",
        amount: "",
        description: "",
        expense_date: new Date().toISOString().split('T')[0],
      })
    }
    setModal({ type, expense })
  }

  const handleSave = async () => {
    if (!formData.amount || !formData.expense_type_id) {
      toast.error("Veuillez remplir tous les champs obligatoires")
      return
    }

    setIsSaving(true)
    try {
      const data = {
        expense_type_id: parseInt(formData.expense_type_id),
        amount: parseFloat(formData.amount),
        description: formData.description || null,
        expense_date: formData.expense_date,
      }

      if (modal?.type === 'edit' && modal.expense) {
        const { error } = await supabase
          .from('expenses')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', modal.expense.id)
        if (error) throw error
        toast.success("Dépense modifiée")
      } else {
        const { error } = await supabase
          .from('expenses')
          .insert(data)
        if (error) throw error
        toast.success("Dépense ajoutée")
      }

      setModal(null)
      loadData()
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de l'enregistrement")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteModal) return
    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', deleteModal.id)
      if (error) throw error
      toast.success("Dépense supprimée")
      setDeleteModal(null)
      loadData()
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de la suppression")
    } finally {
      setIsDeleting(false)
    }
  }

  const openTypeModal = (type: 'create' | 'edit', expenseType?: ExpenseType) => {
    if (type === 'edit' && expenseType) {
      setTypeFormData({ name: expenseType.name, description: expenseType.description || "" })
    } else {
      setTypeFormData({ name: "", description: "" })
    }
    setTypeModal({ type, expenseType })
  }

  const handleSaveType = async () => {
    if (!typeFormData.name) {
      toast.error("Le nom est obligatoire")
      return
    }

    setIsSaving(true)
    try {
      if (typeModal?.type === 'edit' && typeModal.expenseType) {
        const { error } = await supabase
          .from('expense_types')
          .update({ name: typeFormData.name, description: typeFormData.description || null })
          .eq('id', typeModal.expenseType.id)
        if (error) throw error
        toast.success("Type modifié")
      } else {
        const { error } = await supabase
          .from('expense_types')
          .insert({ name: typeFormData.name, description: typeFormData.description || null })
        if (error) throw error
        toast.success("Type ajouté")
      }

      setTypeModal(null)
      loadData()
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de l'enregistrement")
    } finally {
      setIsSaving(false)
    }
  }

  const filteredExpenses = expenses.filter(e => {
    if (filterType && e.expense_type_id?.toString() !== filterType) return false
    if (filterMonth && !e.expense_date.startsWith(filterMonth)) return false
    return true
  })

  const totalFiltered = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' F'
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-950">Dépenses</h1>
          <p className="text-sm text-neutral-500 mt-1">Gérer les dépenses et les types de dépenses</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => openTypeModal('create')}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Type
          </button>
          <button
            onClick={() => openModal('create')}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Dépense
          </button>
        </div>
      </div>

      {/* Filters & Summary */}
      <div className="flex flex-wrap items-center gap-6 p-5 bg-white rounded-xl border border-neutral-200">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-neutral-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
          >
            <option value="">Tous les types</option>
            {expenseTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-neutral-400" />
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="px-3 py-1.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="text-sm text-neutral-500">
            {filteredExpenses.length} dépense{filteredExpenses.length > 1 ? 's' : ''}
          </div>
          <div className="text-lg font-semibold text-red-600">
            Total: {formatCurrency(totalFiltered)}
          </div>
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={5} cols={4} />
        ) : filteredExpenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
            <Wallet className="w-12 h-12 mb-3 stroke-1" />
            <p>Aucune dépense trouvée</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Description</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase">Montant</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-neutral-600">
                    {new Date(expense.expense_date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2.5 py-1 text-xs font-medium bg-neutral-100 text-neutral-700 rounded-full">
                      {expense.expense_type?.name || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">
                    {expense.description || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-red-600 text-right">
                    {formatCurrency(expense.amount)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openModal('edit', expense)}
                        className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteModal(expense)}
                        className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Types Section */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-medium text-neutral-950">Types de dépenses</h2>
          <button
            onClick={() => openTypeModal('create')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-600 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Ajouter
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          {expenseTypes.map(type => {
            const isUsed = expenses.some(e => e.expense_type_id === type.id)
            return (
              <div
                key={type.id}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-neutral-50 border border-neutral-200 text-neutral-700 rounded-lg group hover:bg-neutral-100 transition-colors"
              >
                <span className="font-medium">{type.name}</span>
                <button
                  onClick={() => openTypeModal('edit', type)}
                  className="p-1 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-200 rounded transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                {!isUsed && (
                  <button
                    onClick={() => setDeleteTypeModal(type)}
                    className="p-1 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Supprimer (non utilisé)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
        {expenseTypes.length === 0 && (
          <p className="text-sm text-neutral-500">Aucun type de dépense</p>
        )}
      </div>

      {/* Expense Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-neutral-950">
                {modal.type === 'create' ? 'Nouvelle dépense' : 'Modifier la dépense'}
              </h2>
              <button onClick={() => setModal(null)} className="p-2 hover:bg-neutral-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Type *</label>
                <select
                  value={formData.expense_type_id}
                  onChange={(e) => setFormData({ ...formData, expense_type_id: e.target.value })}
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                >
                  <option value="">Sélectionner un type</option>
                  {expenseTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Montant (FCFA) *</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.expense_date}
                  onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
                  rows={3}
                  placeholder="Description optionnelle..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModal(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-neutral-600 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSaving ? "Enregistrement..." : modal.type === 'create' ? 'Ajouter' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Type Modal */}
      {typeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-neutral-950">
                {typeModal.type === 'create' ? 'Nouveau type' : 'Modifier le type'}
              </h2>
              <button onClick={() => setTypeModal(null)} className="p-2 hover:bg-neutral-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Nom *</label>
                <input
                  type="text"
                  value={typeFormData.name}
                  onChange={(e) => setTypeFormData({ ...typeFormData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  placeholder="Ex: Électricité"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                <input
                  type="text"
                  value={typeFormData.description}
                  onChange={(e) => setTypeFormData({ ...typeFormData, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  placeholder="Description optionnelle"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setTypeModal(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-neutral-600 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveType}
                disabled={isSaving}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSaving ? "Enregistrement..." : typeModal.type === 'create' ? 'Ajouter' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
            <h2 className="text-lg font-semibold text-neutral-950 mb-2">Supprimer la dépense ?</h2>
            <p className="text-sm text-neutral-500 mb-6">
              Cette action est irréversible. La dépense de {formatCurrency(deleteModal.amount)} sera définitivement supprimée.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-neutral-600 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isDeleting ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Type Modal */}
      {deleteTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
            <h2 className="text-lg font-semibold text-neutral-950 mb-2">Supprimer le type ?</h2>
            <p className="text-sm text-neutral-500 mb-6">
              Le type "{deleteTypeModal.name}" sera définitivement supprimé.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTypeModal(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-neutral-600 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={async () => {
                  try {
                    const { error } = await supabase
                      .from('expense_types')
                      .delete()
                      .eq('id', deleteTypeModal.id)
                    if (error) throw error
                    toast.success("Type supprimé")
                    setDeleteTypeModal(null)
                    loadData()
                  } catch (error) {
                    console.error(error)
                    toast.error("Erreur lors de la suppression")
                  }
                }}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
