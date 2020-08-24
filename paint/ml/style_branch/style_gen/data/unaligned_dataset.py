import os.path
from data.base_dataset import BaseDataset, get_transform
from data.image_folder import make_dataset
from PIL import Image
import random


class UnalignedDataset(BaseDataset):
    def __init__(self, opt):
        BaseDataset.__init__(self, opt)
        self.A_paths = [opt.A_path]
        self.B_paths = [opt.B_path]
        btoA = self.opt.direction == 'BtoA'
        input_nc = self.opt.output_nc if btoA else self.opt.input_nc       
        output_nc = self.opt.input_nc if btoA else self.opt.output_nc      
        self.transform_A = get_transform(self.opt, grayscale=(input_nc == 1))
        self.transform_B = get_transform(self.opt, grayscale=(output_nc == 1))

    def __getitem__(self, index):
        if len(self.A_paths) == 1:
            A_path = self.A_paths[0]
            B_path = self.B_paths[0]
        else:
            A_path = self.A_paths[index % self.A_size] 
            if self.opt.serial_batches:  
                index_B = index % self.B_size
            else:  
                index_B = random.randint(0, self.B_size - 1)
            B_path = self.B_paths[index_B]
        
        A_img = Image.open(A_path).convert('RGB')
        B_img = Image.open(B_path).convert('RGB')
    
        A = self.transform_A(A_img)
        B = self.transform_B(B_img)

        return {'A': A, 'B': B, 'A_paths': A_path, 'B_paths': B_path}

    def __len__(self):
        return max(self.A_size, self.B_size)
