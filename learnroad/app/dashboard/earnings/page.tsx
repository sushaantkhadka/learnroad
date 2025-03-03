"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2, DollarSign, TrendingUp, Calendar } from "lucide-react"

interface EarningsData {
  totalEarnings: number
  availableBalance: number
  monthlyEarnings: number
  completedSessions: Array<{
    _id: string
    subject: string
    date: string
    price: number
  }>
  recentPayments: Array<{
    _id: string
    amount: number
    createdAt: string
    type: string
  }>
}

export default function EarningsPage() {
  const { data: session } = useSession()
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [withdrawalAmount, setWithdrawalAmount] = useState("")
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const { toast } = useToast()

  const fetchEarningsData = async () => {
    try {
      const response = await fetch("/api/earnings")
      if (!response.ok) {
        throw new Error("Failed to fetch earnings data")
      }
      const data = await response.json()
      setEarningsData(data)
    } catch (error) {
      console.error("Error fetching earnings data:", error)
      toast({
        title: "Error",
        description: "Failed to load earnings data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user.role === "tutor") {
      fetchEarningsData()
    }
  }, [session])

  const handleWithdrawal = async () => {
    if (!withdrawalAmount || isNaN(Number.parseFloat(withdrawalAmount))) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid withdrawal amount.",
        variant: "destructive",
      })
      return
    }

    setIsWithdrawing(true)

    try {
      const response = await fetch("/api/earnings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: Number.parseFloat(withdrawalAmount) }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to process withdrawal")
      }

      const { newAvailableBalance } = await response.json()

      toast({
        title: "Withdrawal successful",
        description: `$${withdrawalAmount} has been withdrawn from your account.`,
      })

      // Update the available balance
      setEarningsData((prevData) => {
        if (prevData) {
          return {
            ...prevData,
            availableBalance: newAvailableBalance,
            recentPayments: [
              {
                _id: Date.now().toString(),
                amount: Number.parseFloat(withdrawalAmount),
                createdAt: new Date().toISOString(),
                type: "withdrawal",
              },
              ...prevData.recentPayments,
            ],
          }
        }
        return prevData
      })

      setWithdrawalAmount("")
    } catch (error) {
      console.error("Error processing withdrawal:", error)
      toast({
        title: "Withdrawal failed",
        description:
          error instanceof Error ? error.message : "There was an error processing your withdrawal. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsWithdrawing(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  if (!earningsData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p>Failed to load earnings data.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <h2 className="text-3xl font-bold tracking-tight">Earnings</h2>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${earningsData.totalEarnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Lifetime earnings</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${earningsData.availableBalance.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Available for withdrawal</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${earningsData.monthlyEarnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">This month&apos;s earnings</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
              <CardDescription>Your most recent completed sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {earningsData.completedSessions.slice(0, 5).map((session) => (
                  <div key={session._id} className="flex items-center">
                    <Calendar className="h-9 w-9 text-primary" />
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{session.subject}</p>
                      <p className="text-sm text-muted-foreground">{new Date(session.date).toLocaleDateString()}</p>
                    </div>
                    <div className="ml-auto font-medium">${session.price.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your most recent payments and withdrawals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {earningsData.recentPayments.map((payment) => (
                  <div key={payment._id} className="flex items-center">
                    <DollarSign className="h-9 w-9 text-primary" />
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {payment.type === "withdrawal" ? "Withdrawal" : "Payment"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      {payment.type === "withdrawal" ? "-" : "+"}${Math.abs(payment.amount).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Withdraw Funds</CardTitle>
            <CardDescription>Transfer your available balance to your bank account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Input
                type="number"
                placeholder="Enter amount"
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
                className="max-w-[200px]"
              />
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    disabled={
                      !withdrawalAmount ||
                      isNaN(Number.parseFloat(withdrawalAmount)) ||
                      Number.parseFloat(withdrawalAmount) > earningsData.availableBalance
                    }
                  >
                    Withdraw Funds
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Withdrawal</DialogTitle>
                    <DialogDescription>Are you sure you want to withdraw ${withdrawalAmount}?</DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setWithdrawalAmount("")}>
                      Cancel
                    </Button>
                    <Button onClick={handleWithdrawal} disabled={isWithdrawing}>
                      {isWithdrawing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Confirm Withdrawal"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

