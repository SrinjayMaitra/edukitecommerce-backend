import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Table, Badge, Input, Textarea, Label, Checkbox } from "@medusajs/ui"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { CreditCard } from "@medusajs/icons"

const SubscriptionPlansPage = () => {
  const queryClient = useQueryClient()
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    class_level: "",
    monthly_price: "",
    yearly_price: "",
    currency_code: "USD",
    is_active: true,
    features: [] as string[],
  })
  const [newFeature, setNewFeature] = useState("")

  // Fetch subscription plans
  const { data: plans, isLoading } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const response = await fetch("/admin/subscription-plans")
      if (!response.ok) throw new Error("Failed to fetch plans")
      const data = await response.json()
      return data.subscription_plans || []
    },
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      try {
        const response = await fetch("/admin/subscription-plans", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(data),
        })
        if (!response.ok) {
          const errorText = await response.text()
          let errorMessage = "Failed to create plan"
          try {
            const error = JSON.parse(errorText)
            errorMessage = error.message || error.error || errorMessage
          } catch {
            errorMessage = errorText || errorMessage
          }
          throw new Error(errorMessage)
        }
        return response.json()
      } catch (error: any) {
        console.error("Create plan error:", error)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] })
      setIsCreateModalOpen(false)
      resetForm()
    },
    onError: (error: any) => {
      console.error("Create mutation error:", error)
      alert(`Error creating plan: ${error.message || "Unknown error"}`)
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      try {
        const response = await fetch(`/admin/subscription-plans/${id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(data),
        })
        if (!response.ok) {
          const errorText = await response.text()
          let errorMessage = "Failed to update plan"
          try {
            const error = JSON.parse(errorText)
            errorMessage = error.message || error.error || errorMessage
          } catch {
            errorMessage = errorText || errorMessage
          }
          throw new Error(errorMessage)
        }
        return response.json()
      } catch (error: any) {
        console.error("Update plan error:", error)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] })
      setIsEditModalOpen(false)
      setSelectedPlan(null)
      resetForm()
    },
    onError: (error: any) => {
      console.error("Update mutation error:", error)
      alert(`Error updating plan: ${error.message || "Unknown error"}`)
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/admin/subscription-plans/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete plan")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] })
    },
  })

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      class_level: "",
      monthly_price: "",
      yearly_price: "",
      currency_code: "USD",
      is_active: true,
      features: [],
    })
    setNewFeature("")
  }

  const handleCreate = () => {
    const planData = {
      name: formData.name,
      description: formData.description || undefined,
      class_level: formData.class_level || undefined,
      monthly_price: parseFloat(formData.monthly_price),
      yearly_price: formData.yearly_price ? parseFloat(formData.yearly_price) : undefined,
      currency_code: formData.currency_code,
      is_active: formData.is_active,
      features: formData.features.length > 0 ? formData.features : undefined,
    }
    createMutation.mutate(planData)
  }

  const handleEdit = (plan: any) => {
    setSelectedPlan(plan)
    setFormData({
      name: plan.name || "",
      description: plan.description || "",
      class_level: plan.class_level || "",
      monthly_price: plan.monthly_price?.toString() || "",
      yearly_price: plan.yearly_price?.toString() || "",
      currency_code: plan.currency_code || "USD",
      is_active: plan.is_active !== undefined ? plan.is_active : true,
      features: Array.isArray(plan.features) ? plan.features : [],
    })
    setIsEditModalOpen(true)
  }

  const handleUpdate = () => {
    if (!selectedPlan) return
    const planData = {
      name: formData.name,
      description: formData.description || undefined,
      class_level: formData.class_level || undefined,
      monthly_price: parseFloat(formData.monthly_price),
      yearly_price: formData.yearly_price ? parseFloat(formData.yearly_price) : undefined,
      currency_code: formData.currency_code,
      is_active: formData.is_active,
      features: formData.features.length > 0 ? formData.features : undefined,
    }
    updateMutation.mutate({ id: selectedPlan.id, data: planData })
  }

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()],
      })
      setNewFeature("")
    }
  }

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    })
  }

  if (isLoading) {
    return (
      <Container>
        <Heading>Loading...</Heading>
      </Container>
    )
  }

  return (
    <Container>
      <div className="flex items-center justify-between mb-6">
        <Heading>Subscription Plans</Heading>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          Create Plan
        </Button>
      </div>

      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Class Level</Table.HeaderCell>
            <Table.HeaderCell>Monthly Price</Table.HeaderCell>
            <Table.HeaderCell>Yearly Price</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell>Actions</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {plans?.map((plan: any) => (
            <Table.Row key={plan.id}>
              <Table.Cell>{plan.name}</Table.Cell>
              <Table.Cell>{plan.class_level || "N/A"}</Table.Cell>
              <Table.Cell>${plan.monthly_price?.toFixed(2)}</Table.Cell>
              <Table.Cell>
                {plan.yearly_price ? `$${plan.yearly_price.toFixed(2)}` : "N/A"}
              </Table.Cell>
              <Table.Cell>
                <Badge color={plan.is_active ? "green" : "grey"}>
                  {plan.is_active ? "Active" : "Inactive"}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => handleEdit(plan)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="small"
                    onClick={() => deleteMutation.mutate(plan.id)}
                  >
                    Delete
                  </Button>
                </div>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      {plans?.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No subscription plans found. Create your first plan to get started.
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setIsCreateModalOpen(false)}>
          <div className="bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col m-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-700 flex-shrink-0">
              <Heading level="h2" className="text-white">Create Subscription Plan</Heading>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
            <div className="flex flex-col gap-4">
              <div>
                <Label htmlFor="name">Plan Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Class 4 Monthly Plan"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Plan description..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="class_level" className="text-gray-200">Class Level</Label>
                <select
                  id="class_level"
                  value={formData.class_level}
                  onChange={(e) => setFormData({ ...formData, class_level: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" className="bg-gray-800 text-gray-300">Select class level</option>
                  <option value="Class 4" className="bg-gray-800 text-white">Class 4</option>
                  <option value="Class 5" className="bg-gray-800 text-white">Class 5</option>
                  <option value="Class 6" className="bg-gray-800 text-white">Class 6</option>
                  <option value="Class 7" className="bg-gray-800 text-white">Class 7</option>
                  <option value="Class 8" className="bg-gray-800 text-white">Class 8</option>
                  <option value="Class 9" className="bg-gray-800 text-white">Class 9</option>
                  <option value="Class 10" className="bg-gray-800 text-white">Class 10</option>
                  <option value="Class 11" className="bg-gray-800 text-white">Class 11</option>
                  <option value="Class 12" className="bg-gray-800 text-white">Class 12</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="monthly_price" className="text-gray-200">Monthly Price ($) *</Label>
                  <Input
                    id="monthly_price"
                    type="number"
                    step="0.01"
                    value={formData.monthly_price}
                    onChange={(e) => setFormData({ ...formData, monthly_price: e.target.value })}
                    placeholder="29.99"
                    className="bg-gray-800 text-white border-gray-700 placeholder-gray-500"
                  />
                </div>

                <div>
                  <Label htmlFor="yearly_price" className="text-gray-200">Yearly Price ($)</Label>
                  <Input
                    id="yearly_price"
                    type="number"
                    step="0.01"
                    value={formData.yearly_price}
                    onChange={(e) => setFormData({ ...formData, yearly_price: e.target.value })}
                    placeholder="299.99"
                    className="bg-gray-800 text-white border-gray-700 placeholder-gray-500"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="currency_code" className="text-gray-200">Currency Code</Label>
                <Input
                  id="currency_code"
                  value={formData.currency_code}
                  onChange={(e) => setFormData({ ...formData, currency_code: e.target.value })}
                  placeholder="USD"
                  className="bg-gray-800 text-white border-gray-700 placeholder-gray-500"
                />
              </div>

              <div>
                <Label className="text-gray-200">Status</Label>
                <div className="flex items-center gap-4 mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-700 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-200">Active</span>
                  </label>
                </div>
              </div>

              <div>
                <Label className="text-gray-200">Features</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Add a feature..."
                    className="bg-gray-800 text-white border-gray-700 placeholder-gray-500"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addFeature()
                      }
                    }}
                  />
                  <Button onClick={addFeature} variant="secondary">
                    Add
                  </Button>
                </div>
                {formData.features.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {formData.features.map((feature, index) => (
                      <li key={index} className="flex items-center justify-between bg-gray-800 p-2 rounded border border-gray-700">
                        <span className="text-gray-200">{feature}</span>
                        <Button
                          variant="danger"
                          size="small"
                          onClick={() => removeFeature(index)}
                        >
                          Remove
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            </div>
            <div className="p-6 border-t border-gray-700 flex justify-end gap-2 flex-shrink-0">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsCreateModalOpen(false)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!formData.name || !formData.monthly_price || createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create Plan"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setIsEditModalOpen(false)}>
          <div className="bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col m-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-700 flex-shrink-0">
              <Heading level="h2" className="text-white">Edit Subscription Plan</Heading>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
            <div className="flex flex-col gap-4">
              <div>
                <Label htmlFor="edit-name" className="text-gray-200">Plan Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Class 4 Monthly Plan"
                  className="bg-gray-800 text-white border-gray-700 placeholder-gray-500"
                />
              </div>

              <div>
                <Label htmlFor="edit-description" className="text-gray-200">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Plan description..."
                  rows={3}
                  className="bg-gray-800 text-white border-gray-700 placeholder-gray-500"
                />
              </div>

              <div>
                <Label htmlFor="edit-class_level" className="text-gray-200">Class Level</Label>
                <select
                  id="edit-class_level"
                  value={formData.class_level}
                  onChange={(e) => setFormData({ ...formData, class_level: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" className="bg-gray-800 text-gray-300">Select class level</option>
                  <option value="Class 4" className="bg-gray-800 text-white">Class 4</option>
                  <option value="Class 5" className="bg-gray-800 text-white">Class 5</option>
                  <option value="Class 6" className="bg-gray-800 text-white">Class 6</option>
                  <option value="Class 7" className="bg-gray-800 text-white">Class 7</option>
                  <option value="Class 8" className="bg-gray-800 text-white">Class 8</option>
                  <option value="Class 9" className="bg-gray-800 text-white">Class 9</option>
                  <option value="Class 10" className="bg-gray-800 text-white">Class 10</option>
                  <option value="Class 11" className="bg-gray-800 text-white">Class 11</option>
                  <option value="Class 12" className="bg-gray-800 text-white">Class 12</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-monthly_price" className="text-gray-200">Monthly Price ($) *</Label>
                  <Input
                    id="edit-monthly_price"
                    type="number"
                    step="0.01"
                    value={formData.monthly_price}
                    onChange={(e) => setFormData({ ...formData, monthly_price: e.target.value })}
                    placeholder="29.99"
                    className="bg-gray-800 text-white border-gray-700 placeholder-gray-500"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-yearly_price" className="text-gray-200">Yearly Price ($)</Label>
                  <Input
                    id="edit-yearly_price"
                    type="number"
                    step="0.01"
                    value={formData.yearly_price}
                    onChange={(e) => setFormData({ ...formData, yearly_price: e.target.value })}
                    placeholder="299.99"
                    className="bg-gray-800 text-white border-gray-700 placeholder-gray-500"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-currency_code" className="text-gray-200">Currency Code</Label>
                <Input
                  id="edit-currency_code"
                  value={formData.currency_code}
                  onChange={(e) => setFormData({ ...formData, currency_code: e.target.value })}
                  placeholder="USD"
                  className="bg-gray-800 text-white border-gray-700 placeholder-gray-500"
                />
              </div>

              <div>
                <Label className="text-gray-200">Status</Label>
                <div className="flex items-center gap-4 mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-700 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-200">Active</span>
                  </label>
                </div>
              </div>

              <div>
                <Label className="text-gray-200">Features</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Add a feature..."
                    className="bg-gray-800 text-white border-gray-700 placeholder-gray-500"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addFeature()
                      }
                    }}
                  />
                  <Button onClick={addFeature} variant="secondary">
                    Add
                  </Button>
                </div>
                {formData.features.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {formData.features.map((feature, index) => (
                      <li key={index} className="flex items-center justify-between bg-gray-800 p-2 rounded border border-gray-700">
                        <span className="text-gray-200">{feature}</span>
                        <Button
                          variant="danger"
                          size="small"
                          onClick={() => removeFeature(index)}
                        >
                          Remove
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            </div>
            <div className="p-6 border-t border-gray-700 flex justify-end gap-2 flex-shrink-0">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsEditModalOpen(false)
                  setSelectedPlan(null)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={!formData.name || !formData.monthly_price || updateMutation.isPending}
              >
                {updateMutation.isPending ? "Updating..." : "Update Plan"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Subscription Plans",
  description: "Manage subscription plans for different class levels",
  icon: CreditCard,
})

export default SubscriptionPlansPage
