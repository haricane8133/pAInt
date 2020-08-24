from data.pix2pix_dataset import Pix2pixDataset
from data.image_folder import make_dataset, default_loader


class ADE20KDataset(Pix2pixDataset):

    @staticmethod
    def modify_commandline_options(parser, is_train):
        parser = Pix2pixDataset.modify_commandline_options(parser, is_train)
        parser.set_defaults(preprocess_mode='resize_and_crop')
        if is_train:
            parser.set_defaults(load_size=286)
        else:
            parser.set_defaults(load_size=256)
        parser.set_defaults(crop_size=256)
        parser.set_defaults(display_winsize=256)
        parser.set_defaults(label_nc=150)
        parser.set_defaults(contain_dontcare_label=True)
        parser.set_defaults(cache_filelist_read=False)
        parser.set_defaults(cache_filelist_write=False)
        parser.set_defaults(no_instance=True)
        return parser

    def get_paths(self, opt):
        root = opt.dataroot
        phase = 'val' if opt.phase == 'test' else 'train'
        
        if not opt.use_vae:
            if not opt.single_image:
                all_images = make_dataset(root, recursive=True, read_cache=False, write_cache=False)
            else:
                all_images = [root]

            image_paths = []
            label_paths = []
            for p in all_images:            
                if p.endswith('.jpg'):
                    image_paths.append(p)
                elif p.endswith('.png'):
                    label_paths.append(p)
        else:
            if not opt.single_image:
                print("You should use single segment image if you set use_vae as True")
                exit()
            else:
                image_paths = [opt.style_path]
                label_paths = [opt.dataroot]
            
        instance_paths = []  

        return label_paths, image_paths, instance_paths

    def postprocess(self, input_dict):
        label = input_dict['label']
        label = label - 1
        label[label == -1] = self.opt.label_nc
