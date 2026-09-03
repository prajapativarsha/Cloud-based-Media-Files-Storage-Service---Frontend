import {
  Folder,
  FileText,
  Image,
  Video,
  Music,
  File,
  MoreVertical,
  Eye,
} from "lucide-react";

export default function FileList({
  folders,
  files,
  onFolderClick,
  onFilePreview,
  onShare
}) {
  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return "--";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const formatDate = (isoString) => {
    if (!isoString) return "Today";
    return new Date(isoString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith("image/"))
      return <Image className="h-4 w-4 text-emerald-500" />;
    if (mimeType?.startsWith("video/"))
      return <Video className="h-4 w-4 text-purple-500" />;
    if (mimeType?.startsWith("audio/"))
      return <Music className="h-4 w-4 text-amber-500" />;
    if (mimeType?.includes("pdf") || mimeType?.includes("text"))
      return <FileText className="h-4 w-4 text-blue-500" />;
    return <File className="h-4 w-4 text-slate-400" />;
  };

  const hasItems = folders.length > 0 || files.length > 0;

  return (
    <div className="bg-slate-800 border border-slate-700 shadow-md rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-600 flex items-center justify-between">
        <h3 className="font-semibold text-slate-400 text-sm">
          Files and folders
        </h3>
      </div>

      {!hasItems ? (
        <div className="py-16 text-center text-slate-400 text-sm">
          This folder is empty. Create a folder or upload files to get started.
        </div>
      ) : (
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-slate-100 text-xs font-semibold uppercase bg-slate-700">
              <th className="py-3 px-6">Name</th>
              <th className="py-3 px-6">Owner</th>
              <th className="py-3 px-6">Last modified</th>
              <th className="py-3 px-6">Size</th>
              <th className="py-3 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {/*  Folders  */}
            {folders.map((folder) => (
              <tr
                key={folder.id}
                onDoubleClick={() => onFolderClick(folder.id)}
                className="hover:bg-slate-900/50 transition cursor-pointer group
                border-b border-slate-700"
              >
                <td className="py-3.5 px-6 font-medium text-slate-200 flex items-center gap-3">
                  <div className="p-1.5 text-teal-400 bg-slate-800 rounded-lg">
                    <Folder className="h-4 w-4 fill-amber-500 text-amber-500" />
                  </div>
                  <span>{folder.name}</span>
                </td>
                <td className="py-3.5 px-6 text-slate-500">Me</td>
                <td className="py-3.5 px-6 text-slate-500 ">
                  {formatDate(folder.updated_at)}
                </td>
                <td className="py-3.5 px-6 text-slate-400">--</td>
                {/* <td className="py-3.5 px-6 text-right">
                  <button
                    onClick={() => onFolderClick(folder.id)}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg transition"
                  >
                    Open
                  </button>
                </td> */}

                <td className="py-3.5 px-6 text-right flex items-center justify-end gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onShare({
                        id: folder.id,
                        type: "folder",
                        name: folder.name,
                      });
                    }}
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-medium transition"
                  >
                    Share
                  </button>
                  <button
                    onClick={() => onFolderClick(folder.id)}
                    className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium text-xs rounded-md transition-colors
                       border border-slate-600 "
                  >
                    Open
                  </button>
                </td>
              </tr>
            ))}

            {/* Files */}
            {files.map((file) => (
              <tr
                key={file.id}
                onDoubleClick={() => onFilePreview(file)}
                className="hover:bg-slate-900/50 transition group
                border-b border-slate-700"
              >
                <td className="py-3.5 px-6 font-medium text-slate-200 flex items-center gap-3">
                  <div className="p-1.5 text-teal-400 bg-slate-800 rounded-lg">
                    {getFileIcon(file.mime_type)}
                  </div>
                  <span className="truncate max-w-xs">{file.name}</span>
                </td>
                <td className="py-3.5 px-6 text-slate-500">Me</td>
                <td className="py-3.5 px-6 text-slate-500">
                  {formatDate(file.updated_at)}
                </td>
                <td className="py-3.5 px-6 text-slate-500">
                  {formatBytes(file.size_bytes)}
                </td>
                <td className="py-3.5 px-6 text-right flex items-center justify-end gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onShare({ id: file.id, type: 'file', name: file.name });
                    }}
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-medium flex items-center gap-5 transition"
                  >
                     Share  
                  </button>
                  <button onClick={() => onFilePreview(file)}
                  className="py-1 px-2 text-right text-slate-600 flex items-center justify-end gap-1.5  hover:bg-slate-100 rounded-lg ">
                     <Eye className="h-3.5 w-3.5 "/> Preview
                  </button>
                  
                  <button className="text-slate-400 hover:text-slate-600 p-1 rounded transition">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </td>

                
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
