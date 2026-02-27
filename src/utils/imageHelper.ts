import heic2any from "heic2any";

export const processImageFile = async (file: File): Promise<File> => {
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith(".heic") || fileName.endsWith(".heif")) {
        try {
            const convertedBlob = await heic2any({
                blob: file,
                toType: "image/jpeg",
                quality: 0.7, // ปรับคุณภาพ
            });

            const newFile = new File(
                [Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob],
                file.name.replace(/\.[^/.]+$/, ".jpg"),
                { type: "image/jpeg" }
            );
            return newFile;
        } catch (error) {
            console.error("HEIC conversion failed:", error);
            return file;
        }
    }
    return file;
};