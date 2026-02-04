
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
  } from "@/components/ui/drawer"
  import { TiThMenu } from "react-icons/ti";

const SidebarDraw = () => {
  return (
    <Drawer>
    <DrawerTrigger className="rounded-full cursor-pointer  dark:rotate-0">
        <TiThMenu size={24} />
    </DrawerTrigger>
    <DrawerContent className="fixed inset-1 mt-0 h-screen w-30">
      <DrawerHeader>
        
        <DrawerTitle className="flex justify-center">BN</DrawerTitle>
        <DrawerDescription>hi</DrawerDescription>
      </DrawerHeader>
        <DrawerClose />
    </DrawerContent>
  </Drawer>
  )
}

export default SidebarDraw
