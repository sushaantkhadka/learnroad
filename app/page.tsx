import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import React from 'react'

export default function Home() {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>
            Login to your account
          </CardTitle>
          <CardDescription>
          Enter your email and password to login.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <p>Username</p>
          
        </CardContent>
      </Card>
    </div>
  )
}
