

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASS = "password123";

const Admin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
      setSignedIn(true);
      setError("");
    } else {
      setError("Invalid email or password");
    }
  };

  if (!signedIn) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-background">
        <Card className="w-full max-w-sm shadow-lg">
          <CardHeader>
            <div className="flex flex-col items-center gap-2">
              <Avatar>
                <AvatarImage src="/favicon.png" alt="Admin" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <CardTitle className="text-center">Admin Sign In</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <Button type="submit" className="w-full">Sign In</Button>
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Example dashboard data
  const stats = [
    { label: "Total Users", value: 1280 },
    { label: "Active Stores", value: 42 },
    { label: "Pending Payouts", value: 7 },
    { label: "Revenue (Pi)", value: 3141 },
  ];

  return (
    <div className="container py-10">
      <div className="flex items-center gap-4 mb-8">
        <Avatar>
          <AvatarImage src="/favicon.png" alt="Admin" />
          <AvatarFallback>AD</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome, admin@example.com</p>
        </div>
        <Badge className="ml-auto" variant="secondary">Admin</Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label} className="text-center">
            <CardHeader>
              <CardTitle className="text-lg">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">{stat.value}</span>
            </CardContent>
          </Card>
        ))}
      </div>
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="stores">Stores</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p>List of users will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="stores">
          <Card>
            <CardHeader>
              <CardTitle>Stores</CardTitle>
            </CardHeader>
            <CardContent>
              <p>List of stores will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="payouts">
          <Card>
            <CardHeader>
              <CardTitle>Payouts</CardTitle>
            </CardHeader>
            <CardContent>
              <p>List of payouts will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
