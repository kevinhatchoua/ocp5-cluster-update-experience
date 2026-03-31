import { useState, useRef, useEffect } from "react";
import { MoreVertical, Eye, Droplet, RotateCw, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";

interface NodeKebabMenuProps {
  nodeName: string;
  onDrain?: () => void;
  onRestart?: () => void;
  onDelete?: () => void;
}

export default function NodeKebabMenu({ 
  nodeName,
  onDrain,
  onRestart,
  onDelete 
}: NodeKebabMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleViewDetails = () => {
    setIsOpen(false);
    navigate(`/compute/nodes/${encodeURIComponent(nodeName)}`);
  };

  const handleDrain = () => {
    setIsOpen(false);
    if (onDrain) {
      onDrain();
    }
  };

  const handleRestart = () => {
    setIsOpen(false);
    if (onRestart) {
      onRestart();
    }
  };

  const handleDelete = () => {
    setIsOpen(false);
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-[8px] rounded-[6px] hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.1)] transition-colors"
        aria-label="More actions"
      >
        <MoreVertical className="size-[16px] text-[#4d4d4d] dark:text-[#b0b0b0]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-[4px] w-[200px] bg-white dark:bg-[#1f1f1f] border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.2)] rounded-[8px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.15)] z-[9999]">
          <div className="py-[8px]">
            <button
              onClick={handleViewDetails}
              className="w-full px-[16px] py-[10px] flex items-center gap-[12px] hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.1)] transition-colors text-left"
            >
              <Eye className="size-[16px] text-[#4d4d4d] dark:text-[#b0b0b0]" />
              <span className="text-[14px] text-[#151515] dark:text-white">View node details</span>
            </button>

            <button
              onClick={handleDrain}
              className="w-full px-[16px] py-[10px] flex items-center gap-[12px] hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.1)] transition-colors text-left"
            >
              <Droplet className="size-[16px] text-[#0066cc] dark:text-[#4dabf7]" />
              <span className="text-[14px] text-[#151515] dark:text-white">Drain node</span>
            </button>

            <button
              onClick={handleRestart}
              className="w-full px-[16px] py-[10px] flex items-center gap-[12px] hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.1)] transition-colors text-left"
            >
              <RotateCw className="size-[16px] text-[#ff9800] dark:text-[#ffb74d]" />
              <span className="text-[14px] text-[#151515] dark:text-white">Restart node</span>
            </button>

            <div className="h-[1px] bg-[rgba(0,0,0,0.1)] dark:bg-[rgba(255,255,255,0.1)] my-[8px]" />

            <button
              onClick={handleDelete}
              className="w-full px-[16px] py-[10px] flex items-center gap-[12px] hover:bg-[rgba(201,25,11,0.05)] dark:hover:bg-[rgba(201,25,11,0.15)] transition-colors text-left"
            >
              <Trash2 className="size-[16px] text-[#c9190b] dark:text-[#ee0000]" />
              <span className="text-[14px] text-[#c9190b] dark:text-[#ee0000]">Delete node</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}