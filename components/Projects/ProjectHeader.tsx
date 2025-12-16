import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  EditIcon,
  SunMoonIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetProjectById } from "@/modules/projects/hooks/project";
import { Spinner } from "../ui/spinner";

const ProjectHeader = ({ projectId }: { projectId: string }) => {
  const { data: project, isPending, isError } = useGetProjectById(projectId);
  console.log(project?.name)

  const { setTheme, theme } = useTheme();
  return (
    <header className="p-2 flex justify-between items-center border-b">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={"ghost"}
            size={"sm"}
            className={
              "focus-visible:ring-0 hover:bg-transparent hover:opacity-75 transition-opacity !pl-2"
            }
          >
            <Image
              src={"/logo3.png"}
              alt="Vibe"
              width={28}
              height={28}
              className="shrink-0"
            />
            <span className="text-sm font-medium">
              {isPending ? <Spinner/> : project?.name || "Untitled Project"}
            </span>
            <ChevronDownIcon className="size-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent side={"bottom"} align={"start"}>
          <DropdownMenuItem asChild>
            <Link href={"/"}>
              <ChevronLeftIcon className="size-4" />
              <span>Go to Dashboard</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className={"gap-2"}>
              <SunMoonIcon className="size-4 text-muted-foreground" />
              <span>Appearance</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent sideOffset={5}>
                <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                  <DropdownMenuRadioItem value="light">
                    Light
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark">
                    Dark
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="system">
                    System
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export default ProjectHeader;
