import UploadPanel from "./UploadPanel";

export default function Sidebar({ open, setOpen }) {
    return (
        <div className={`fixed top-0 left-0 h-full w-64 bg-[#11161c] border-r border-gray-800 p-4 transform ${open ? "translate-x-0" : "-translate-x-full"
            } transition-transform`}>

            <h2 className="text-green-400 mb-4">Upload Data</h2>

            <UploadPanel />

        </div>
    );
}