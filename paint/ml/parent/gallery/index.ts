export interface GalleryLast{
    /**
     * This is the index of the last image that is there in the gallery
     * So, `${lastNo.toString()}.png` is the last image in the folder
     * Therefore, the next image must be `${(lastNo + 1).toString()}.png`
     * Make sure to update this file as well
     */
    lastNo: number
}