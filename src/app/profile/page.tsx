"use client";
import { Badge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { Role_type } from "@/config/role";
import { useUser } from "@/hooks/useUser";
import { User } from "@/types/User";
import { LoaderCircleIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

const Page = () => {
  const { user, loading, updateUser, isUpdating, logout, isLoggingOut } =
    useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});

  const handleLogout = () => {
    toast.promise(
      new Promise((resolve, reject) => {
        logout(undefined, {
          onSuccess: () => resolve("Logged out successfully!"),
          onError: (error) => reject(error),
        });
      }),
      {
        loading: "Logging out...",
        success: "Logged out successfully!",
        error: "Logout failed. Please try again.",
      },
    );
  };

  const handleEditToggle = () => {
    if (!isEditing && user) {
      setFormData({
        name: user.name,
        email: user.email,
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    toast.promise(
      new Promise((resolve, reject) => {
        updateUser(formData, {
          onSuccess: () => {
            setIsEditing(false);
            resolve("Profile updated successfully!");
          },
          onError: (error) => {
            reject(error);
          },
        });
      }),
      {
        loading: "Updating profile...",
        success: "Profile updated successfully!",
        error: "Failed to update profile",
      },
    );
  };

  if (loading) {
    return (
      <div className="place-items-center pt-20">
        <Skeleton className="h-72 w-lg place-items-center pt-5 shadow-lg">
          <LoaderCircleIcon className="animate-spin" />
        </Skeleton>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="place-items-center pt-20">
        <Skeleton className="h-72 w-lg place-items-center pt-5 shadow-lg">
          <LoaderCircleIcon className="animate-spin" />
        </Skeleton>
      </div>
    );
  }

  return (
    <main className="space-y-10 px-10 pt-20">
      <section className="flex w-full flex-col items-center justify-center pt-10">
        <p className="text-3xl font-semibold">Your Profile</p>
      </section>
      <section className="flex w-full justify-center">
        <Card className="w-lg max-w-full p-5 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-3 text-xl font-bold">
                <span>Profile Information</span>
                {user.role !== Role_type.USER && <Badge>{user.role}</Badge>}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 items-center gap-4">
              {isEditing ? (
                <>
                  <label className="block font-medium">Name</label>
                  <Input
                    value={formData.name || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    disabled={isUpdating}
                    className="col-span-2"
                  />

                  <label className="block font-medium">Email</label>
                  <Input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    disabled={isUpdating}
                    className="col-span-2"
                  />

                  <label className="block font-medium">Phone</label>
                  {/* <Input
                    value={formData.tel || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, tel: e.target.value })
                    }
                    disabled={isUpdating}
                    className="col-span-2"
                  /> */}
                </>
              ) : (
                <>
                  <strong>Name:</strong>{" "}
                  <span className="col-span-2">{user.name}</span>
                  <strong>Email:</strong>
                  <span className="col-span-2">{user.email} </span>
                  <strong>Phone:</strong>{" "}
                  <span className="col-span-2">{user.tel}</span>
                </>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-gray-500">ID: {user._id}</p>
          </CardFooter>
        </Card>
      </section>
      <section className="flex w-full max-w-lg justify-end space-x-3 justify-self-center px-5">
        {isEditing ? (
          <>
            <Button
              textButton="Cancel"
              onClick={handleEditToggle}
              disabled={isUpdating}
            />
            <Button
              textButton="Confirm"
              onClick={handleSave}
              //isLoading={isUpdating}
            />
          </>
        ) : (
          <>
            <Button textButton="edit" onClick={handleEditToggle} />
            <Button
              textButton="logout"
              //hideTextOnMobile={false}
              className="shadow-3xl"
              onClick={handleLogout}
              disabled={isLoggingOut}
            />
          </>
        )}
      </section>
    </main>
  );
};

export default Page;
