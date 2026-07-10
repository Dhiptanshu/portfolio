import { 
  FaGithub, 
  FaLinkedin, 
  FaXTwitter, 
  FaYoutube, 
  FaInstagram, 
  FaFacebook, 
  FaTwitch, 
  FaTiktok, 
  FaDiscord, 
  FaSlack, 
  FaReddit, 
  FaPinterest, 
  FaSnapchat, 
  FaWhatsapp, 
  FaTelegram, 
  FaMedium, 
  FaDev, 
  FaDribbble, 
  FaBehance, 
  FaFigma, 
  FaSpotify, 
  FaSoundcloud, 
  FaPatreon
} from "react-icons/fa6";
import { Mail, Globe, Link } from "lucide-react";

export function SocialIcon({ name, className = "w-5 h-5" }: { name: string, className?: string }) {
  const n = name.toLowerCase().trim();
  
  if (n.includes("github")) return <FaGithub className={className} />;
  if (n.includes("linkedin")) return <FaLinkedin className={className} />;
  if (n.includes("x") || n.includes("twitter")) return <FaXTwitter className={className} />;
  if (n.includes("youtube")) return <FaYoutube className={className} />;
  if (n.includes("instagram") || n.includes("insta")) return <FaInstagram className={className} />;
  if (n.includes("facebook") || n.includes("fb")) return <FaFacebook className={className} />;
  if (n.includes("twitch")) return <FaTwitch className={className} />;
  if (n.includes("tiktok")) return <FaTiktok className={className} />;
  if (n.includes("discord")) return <FaDiscord className={className} />;
  if (n.includes("slack")) return <FaSlack className={className} />;
  if (n.includes("reddit")) return <FaReddit className={className} />;
  if (n.includes("pinterest")) return <FaPinterest className={className} />;
  if (n.includes("snapchat")) return <FaSnapchat className={className} />;
  if (n.includes("whatsapp")) return <FaWhatsapp className={className} />;
  if (n.includes("telegram")) return <FaTelegram className={className} />;
  if (n.includes("medium")) return <FaMedium className={className} />;
  if (n.includes("dev.to") || n.includes("devto")) return <FaDev className={className} />;
  if (n.includes("dribbble")) return <FaDribbble className={className} />;
  if (n.includes("behance")) return <FaBehance className={className} />;
  if (n.includes("figma")) return <FaFigma className={className} />;
  if (n.includes("spotify")) return <FaSpotify className={className} />;
  if (n.includes("soundcloud")) return <FaSoundcloud className={className} />;
  if (n.includes("patreon")) return <FaPatreon className={className} />;
  if (n.includes("mail") || n.includes("email")) return <Mail className={className} />;
  if (n.includes("website") || n.includes("portfolio")) return <Globe className={className} />;
  
  return <Link className={className} />;
}
