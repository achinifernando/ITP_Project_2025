import { API_PATHS } from "./apiPaths";
import axiosInstance from "./axiosInstance";

const uploadImage = async (imageFile) =>{
    const formData = new FormData();
    //append image file to form data
    formData.append('image', imageFile);

    try{
        const response = await axiosInstance.post(API_PATHS.IMAGE.UPLOAD_IMAGE, formData, {
            headers: {
                'Content-Type': 'multipart/form-data', //set header for file uplaod
            },
        });
        return response.data; //return respons data
    }catch (error) {
        console.error('Enter uploading the image', error);
        throw error; // rethorw error for handling
    }
};

export default uploadImage;
