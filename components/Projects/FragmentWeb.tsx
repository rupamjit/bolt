import React, { useState } from "react";
import { ExternalLink, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hint } from "@/components/ui/Hint";
import Link from "next/link";

interface Fragment {
  id: string;
  title: string;
  sandboxUrl: string;
  files: any;
  createdAt: Date;
  updatedAt: Date;
  messageId: string;
}

const FragmentWeb = ({ data }: { data: Fragment }) => {
  console.log(data);
  const [fragmentKey, setFragmentKey] = useState(0);
  const [copied, setCopied] = useState(false);

  const onRefresh = () => {
    setFragmentKey((prev) => prev + 1);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(data.sandboxUrl);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col w-full h-full">
      <div className="p-2 border-b bg-sidebar flex items-center gap-x-2">
        <Hint text={"Refresh"} side={"bottom"} align={"start"}>
          <Button size={"sm"} variant={"outline"} onClick={onRefresh}>
            <RefreshCcw />
          </Button>
        </Hint>
        <Hint
          text={copied ? "Copied" : "Click to copy"}
          side={"bottom"}
          align={"start"}
        >
          <Button
            size={"sm"}
            variant={"outline"}
            onClick={handleCopy}
            disabled={!data.sandboxUrl || copied}
            className={"flex-1 justify-start text-start font-normal"}
          >
            <span className="truncate">{data.sandboxUrl}</span>
          </Button>
        </Hint>
        <Hint text={"Open in new tab"} side={"bottom"} align={"start"}>
          <Button asChild size="sm" variant="outline">
            <Link
              href={data.sandboxUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink />
            </Link>
          </Button>
        </Hint>
      </div>
      <iframe
        key={fragmentKey}
        className="h-full w-full"
        sandbox="allow-scripts allow-same-origin allow-scripts"
        loading="lazy"
        src={data.sandboxUrl}
      />
    </div>
  );
};

export default FragmentWeb;


// import React, { useState } from "react";
// import { ExternalLink, RefreshCcw } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Hint } from "@/components/ui/Hint";

// interface Fragment {
//   id: string;
//   title: string;
//   sandboxUrl: string;
//   files: any;
//   createdAt: Date;
//   updatedAt: Date;
//   messageId: string;
// }

// const FragmentWeb = ({ data }: { data: Fragment }) => {
//   console.log(data);
//   const [fragmentKey, setFragmentKey] = useState(0);
//   const [copied, setCopied] = useState(false);

//   const onRefresh = () => {
//     setFragmentKey((prev) => prev + 1);
//   };

//   const handleCopy = () => {
//     if (!data.sandboxUrl) return;
//     navigator.clipboard.writeText(data.sandboxUrl);
//     setCopied(true);
//     setTimeout(() => {
//       setCopied(false);
//     }, 2000);
//   };

//   return (
//     <div className="flex flex-col w-full h-full">
//       <div className="p-2 border-b bg-sidebar flex items-center gap-x-2">
//         <Hint text={"Refresh"} side={"bottom"} align={"start"}>
//           <Button size={"sm"} variant={"outline"} onClick={onRefresh}>
//             <RefreshCcw />
//           </Button>
//         </Hint>
//         <Hint
//           text={copied ? "Copied" : "Click to copy"}
//           side={"bottom"}
//           align={"start"}
//         >
//           <Button
//             size={"sm"}
//             variant={"outline"}
//             onClick={handleCopy}
//             disabled={!data.sandboxUrl || copied}
//             className={"flex-1 justify-start text-start font-normal"}
//           >
//             <span className="truncate">
//               {data.sandboxUrl || "Generating preview..."}
//             </span>
//           </Button>
//         </Hint>
//         <Hint text={"Open in new tab"} side={"bottom"} align={"start"}>
//           <Button
//             size={"sm"}
//             variant={"outline"}
//             onClick={() => data.sandboxUrl && window.open(data.sandboxUrl, "_blank")}
//             disabled={!data.sandboxUrl}
//           >
//             <ExternalLink />
//           </Button>
//         </Hint>
//       </div>
//       <iframe
//         key={fragmentKey}
//         className="h-full w-full"
//         sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
//         loading="lazy"
//         src={data.sandboxUrl}
//       />
//     </div>
//   );
// };

// export default FragmentWeb;
