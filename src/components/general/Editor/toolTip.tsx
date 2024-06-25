import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Mic } from "lucide-react";

interface ITooltip {
   text: string;
   position: { top: number; left: number; right: number; bottom: number };
   enhanceSection: () => void;
   reduceLength: () => void;
}
const Tooltip = ({ text, position, enhanceSection, reduceLength }: ITooltip) => {
   const top = `${(position.top / 16).toFixed(1)}rem`;
   const left = `${(position.left / 16).toFixed(1)}rem`;
   const right = `${(position.right / 16).toFixed(1)}rem`;
   const bottom = `${(position.bottom / 16).toFixed(1)}rem`;
   const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
      event.stopPropagation();
   };
   return (
      <div
         onClick={handleClick}
         className={cn(
            `flex -translate-y-1/2 translate-x-1/2 transform flex-col border border-gray-50 bg-white shadow-md transition-all duration-300 ease-in-out`,
         )}
         style={{
            top: `${top}`,
            // left: `${left}`,
            position: "absolute",
            zIndex: 1000,

            borderRadius: "0.5rem",
         }}
      >
         <div className="">
            <p className=" bg-gray-100 px-3 py-3 text-sm  font-semibold ">{text.slice(0, 50)}</p>
            <Button
               onClick={reduceLength}
               className="flex w-full justify-start gap-2 border-none text-gray-400"
               variant={"outline"}
            >
               Reduce Length
            </Button>
            <Button
               onClick={enhanceSection}
               className="flex w-full justify-start gap-2 border-none text-gray-400"
               variant={"outline"}
            >
               Enhance Section
            </Button>
            <Button
               className="flex w-full justify-between gap-2 border-none text-gray-400"
               variant={"outline"}
            >
               <span> Tell Us to...</span>
               <Mic className="h-4 w-4 " />
            </Button>
         </div>
      </div>
   );
};

export default Tooltip;
