import {create} from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set,get) => ({
    message:[],
    users:[],
    selectedUser:null,
    isUserLoading:false,
    isMessageLoading:false,

    getUsers:async() => {
        set({isUserLoading:true})
        try {
            const res = await axiosInstance.get("/message/users");
            set({users:res.data})
            
        } catch (error) {
            toast.error(error.response.data.message);
            
        }finally{
            set({isUserLoading:false})
        }
    },

    getMessage:async(userId) => {
        set({isMessageLoading:true})
        try {
            const res = await axiosInstance.get(`/message/${userId}`);
            set({message:res.data})
            
        } catch (error) {
            toast.error(error.response.data.message);
            
        }finally{
            set({isMessageLoading:false})
        }
    },
    sendMessage : async(messageData) => {
        const {selectedUser,message} = get()

        try {
            const res = await axiosInstance.post(`/message/send/${selectedUser._id}`,messageData);
            set({message:[...message,res.data]});
        } catch (error) {
            toast.error(error.response.data.message);
            
        }

    },

    subcribeToMessage: () => {
        const {selectedUser} = get();
        if(!selectedUser) return;

        const socket = useAuthStore.getState().socket;
        socket.on("newMessage",newMessage => {
            if(newMessage.senderId !== selectedUser._id) return;
            set({message:[...get().message,newMessage]});
        })


    },
    unsubcribeToMessage: () => {
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
    },
    

    setSelectedUser:(user) => set({selectedUser:user})

}))