import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Table, Badge, Button } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { Users } from "@medusajs/icons"

const CustomerSubscriptionsPage = () => {
  // Fetch customer subscriptions
  const { data: subscriptions, isLoading, error } = useQuery({
    queryKey: ["customer-subscriptions"],
    queryFn: async () => {
      const response = await fetch("/admin/customer-subscriptions")
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to fetch subscriptions")
      }
      const data = await response.json()
      return data.customer_subscriptions || []
    },
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "green"
      case "paused":
        return "yellow"
      case "cancelled":
        return "red"
      case "expired":
        return "grey"
      default:
        return "grey"
    }
  }

  if (isLoading) {
    return (
      <Container>
        <Heading>Loading...</Heading>
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <Heading className="mb-4">Error</Heading>
        <p className="text-red-500">
          {error instanceof Error ? error.message : "An error occurred while loading subscriptions"}
        </p>
      </Container>
    )
  }

  return (
    <Container>
      <Heading className="mb-6">Customer Subscriptions</Heading>

      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Customer ID</Table.HeaderCell>
            <Table.HeaderCell>Plan ID</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell>Billing Period</Table.HeaderCell>
            <Table.HeaderCell>Period Start</Table.HeaderCell>
            <Table.HeaderCell>Period End</Table.HeaderCell>
            <Table.HeaderCell>Actions</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {subscriptions?.map((subscription: any) => (
            <Table.Row key={subscription.id}>
              <Table.Cell>{subscription.customer_id}</Table.Cell>
              <Table.Cell>{subscription.subscription_plan_id}</Table.Cell>
              <Table.Cell>
                <Badge color={getStatusColor(subscription.status)}>
                  {subscription.status}
                </Badge>
              </Table.Cell>
              <Table.Cell className="capitalize">
                {subscription.billing_period}
              </Table.Cell>
              <Table.Cell>
                {subscription.current_period_start
                  ? new Date(subscription.current_period_start).toLocaleDateString()
                  : "N/A"}
              </Table.Cell>
              <Table.Cell>
                {subscription.current_period_end
                  ? new Date(subscription.current_period_end).toLocaleDateString()
                  : "N/A"}
              </Table.Cell>
              <Table.Cell>
                <div className="flex gap-2">
                  {subscription.status === "active" && (
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={async () => {
                        await fetch(`/admin/customer-subscriptions/${subscription.id}/pause`, {
                          method: "POST",
                        })
                        window.location.reload()
                      }}
                    >
                      Pause
                    </Button>
                  )}
                  {subscription.status === "paused" && (
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={async () => {
                        await fetch(`/admin/customer-subscriptions/${subscription.id}/resume`, {
                          method: "POST",
                        })
                        window.location.reload()
                      }}
                    >
                      Resume
                    </Button>
                  )}
                  <Button
                    variant="danger"
                    size="small"
                    onClick={async () => {
                      await fetch(`/admin/customer-subscriptions/${subscription.id}/cancel`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ cancel_at_period_end: false }),
                      })
                      window.location.reload()
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      {subscriptions?.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No customer subscriptions found.
        </div>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Customer Subscriptions",
  description: "View and manage customer subscriptions",
  icon: Users,
})

export default CustomerSubscriptionsPage

