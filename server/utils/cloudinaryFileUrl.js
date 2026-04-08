import cloudinary from "../config/cloudinaryConfig.js";

export const getSignedCloudinaryDownloadUrl = (fileUrl) => {
  if (!fileUrl) return fileUrl;

  try {
    const parsedUrl = new URL(fileUrl);
    if (!parsedUrl.hostname.includes("res.cloudinary.com")) {
      return fileUrl;
    }

    const pathSegments = parsedUrl.pathname.split("/").filter(Boolean);
    const uploadIndex = pathSegments.findIndex((segment) => segment === "upload");
    if (uploadIndex === -1 || uploadIndex < 1) {
      return fileUrl;
    }

    const resource_type = pathSegments[uploadIndex - 1];
    const versionSegment = pathSegments[uploadIndex + 1];
    const hasVersion = versionSegment?.startsWith("v");
    const assetSegments = pathSegments.slice(uploadIndex + (hasVersion ? 2 : 1));

    if (assetSegments.length === 0) {
      return fileUrl;
    }

    const assetPath = assetSegments.join("/");
    const extensionIndex = assetPath.lastIndexOf(".");
    const public_id = extensionIndex === -1 ? assetPath : assetPath.slice(0, extensionIndex);
    const format = extensionIndex === -1 ? undefined : assetPath.slice(extensionIndex + 1);

    if (!format) {
      return fileUrl;
    }

    return cloudinary.utils.private_download_url(public_id, format, {
      resource_type,
      type: "upload",
      attachment: false,
      expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
    });
  } catch {
    return fileUrl;
  }
};
