import { FloatingDock } from "../ui/floating-dock";
import {
  IconBrandGithub,
  IconBrandX,
  IconBrandInstagram,
  IconBrandLinkedin
} from "@tabler/icons-react";

const Footer = () => {
  const socialLinks = [
    {
      title: "Instagram",
      icon: (
        <div className="w-full h-full bg-gradient-to-b from-[#FEDB37] via-[#FCA838] to-[#FF7950] rounded-lg flex items-center justify-center">
          <IconBrandInstagram className="h-3/4 w-3/4 text-white" />
        </div>
      ),
      href: "https://www.instagram.com/khan__arkan786/",
    },
    {
      title: "X (Twitter)",
      icon: (
        <div className="w-full h-full bg-black rounded-lg flex items-center justify-center">
          <IconBrandX className="h-3/4 w-3/4 text-white" />
        </div>
      ),
      href: "https://x.com/arkan__khan_",
    },
    {
      title: "LinkedIn",
      icon: (
        <div className="w-full h-full bg-[#0077B5] rounded-lg flex items-center justify-center">
          <IconBrandLinkedin className="h-3/4 w-3/4 text-white" />
        </div>
      ),
      href: "https://www.linkedin.com/in/arkan-khan-4b97a32b9/",
    },
    {
      title: "GitHub",
      icon: (
        <div className="w-full h-full bg-[#24292F] rounded-lg flex items-center justify-center">
          <IconBrandGithub className="h-3/4 w-3/4 text-white" />
        </div>
      ),
      href: "https://github.com/Arkan-Khan",
    }
  ];

  return (
    <footer className="bg-gray-950 text-white py-4 px-4 border-t border-gray-800 relative">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <div className="text-md text-gray-400">
          Reach me at: arkankhan051@gmail.com
        </div>

        <div className='flex flex-col'>
          <p className='text-lg mb-2 text-center text-white'>follow me on</p>
          <FloatingDock
            items={socialLinks}
          />
        </div>

        <div className="text-md text-gray-400">FindIT. Made with ❤️
        </div>
      </div>
    </footer>
  );
};

export default Footer;