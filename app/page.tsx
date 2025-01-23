'use client'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Facebook, Github, Terminal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (username == "krishma" && password=="krishma123") {
      router.push("/dashboard")
    } else {
      alert("Invalid Username or password")
      return (
        <Alert variant={"destructive"}>
          <Terminal>
            <AlertTitle>
              Invalid Credentials
            </AlertTitle>
            <AlertDescription>
              Your username or password is incorrect.
            </AlertDescription>
          </Terminal>
        </Alert>
      )
    }
  }

  


  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email and password to login.
          </CardDescription>

          <div className="flex gap-2 py-4">
          <Button variant={"outline"} className="w-full">
            <Github />
            Github
          </Button> <Button variant={"outline"} className="w-full">
            <Facebook />
            Facebook
          </Button>
          </div>
          <p className="flex justify-center text-sm text-gray-500">OR CONTINUE WITH</p>
        </CardHeader>

        <CardContent>
          <p className="text-sm font-semibold py-2 text-gray-700">Username</p>
          <Input type="text" placeholder="Enter your username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <p className="text-sm font-semibold py-2 text-gray-700" >Password</p>
          <Input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button className="w-full bg-blue-500 hover:bg-blue-800" onClick={handleLogin}>Login</Button>
          <p>
            Don&apos;t have account?{" "}
            <Link href={"#"} className="text-blue-500">
              Create Account
            </Link>{" "}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
