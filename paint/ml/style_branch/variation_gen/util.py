from __future__ import print_function
import torch
import numpy as np
from PIL import Image
import os
import pickle


def tensor2im(input_image, imtype=np.uint8):
    if not isinstance(input_image, np.ndarray):
        if isinstance(input_image, torch.Tensor):
            image_tensor = input_image.data
        else:
            return input_image
        image_numpy = image_tensor[0].cpu().float().numpy() 
        if image_numpy.shape[0] == 1: 
            image_numpy = np.tile(image_numpy, (3, 1, 1))
        image_numpy = (np.transpose(image_numpy, (1, 2, 0)) + 1) / 2.0 * 255.0 
    else:  
        image_numpy = input_image
    return image_numpy.astype(imtype)


def tensor2vec(vector_tensor):
    numpy_vec = vector_tensor.data.cpu().numpy()
    if numpy_vec.ndim == 4:
        return numpy_vec[:, :, 0, 0]
    else:
        return numpy_vec


def pickle_load(file_name):
    data = None
    with open(file_name, 'rb') as f:
        data = pickle.load(f)
    return data


def pickle_save(file_name, data):
    with open(file_name, 'wb') as f:
        pickle.dump(data, f, protocol=pickle.HIGHEST_PROTOCOL)


def diagnose_network(net, name='network'):
    mean = 0.0
    count = 0
    for param in net.parameters():
        if param.grad is not None:
            mean += torch.mean(torch.abs(param.grad.data))
            count += 1
    if count > 0:
        mean = mean / count
    print(name)
    print(mean)


def interp_z(z0, z1, num_frames, interp_mode='linear'):
    zs = []
    if interp_mode == 'linear':
        for n in range(num_frames):
            ratio = n / float(num_frames - 1)
            z_t = (1 - ratio) * z0 + ratio * z1
            zs.append(z_t[np.newaxis, :])
        zs = np.concatenate(zs, axis=0).astype(np.float32)

    if interp_mode == 'slerp':
        z0_n = z0 / (np.linalg.norm(z0) + 1e-10)
        z1_n = z1 / (np.linalg.norm(z1) + 1e-10)
        omega = np.arccos(np.dot(z0_n, z1_n))
        sin_omega = np.sin(omega)
        if sin_omega < 1e-10 and sin_omega > -1e-10:
            zs = interp_z(z0, z1, num_frames, interp_mode='linear')
        else:
            for n in range(num_frames):
                ratio = n / float(num_frames - 1)
                z_t = np.sin((1 - ratio) * omega) / sin_omega * z0 + np.sin(ratio * omega) / sin_omega * z1
                zs.append(z_t[np.newaxis, :])
        zs = np.concatenate(zs, axis=0).astype(np.float32)

    return zs


def save_image(image_numpy, image_path, aspect_ratio=1.0):
    image_pil = Image.fromarray(image_numpy)
    h, w, _ = image_numpy.shape

    if aspect_ratio > 1.0:
        image_pil = image_pil.resize((h, int(w * aspect_ratio)), Image.BICUBIC)
    if aspect_ratio < 1.0:
        image_pil = image_pil.resize((int(h / aspect_ratio), w), Image.BICUBIC)
    image_pil.save(image_path)



def mkdirs(paths):
    if isinstance(paths, list) and not isinstance(paths, str):
        for path in paths:
            mkdir(path)
    else:
        mkdir(paths)


def mkdir(path):
    if not os.path.exists(path):
        os.makedirs(path)
