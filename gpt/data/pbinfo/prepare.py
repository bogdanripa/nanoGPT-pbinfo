import os
import numpy as np

train_ids=[]
val_ids=[]

input_folder_path = os.path.join(os.path.dirname(__file__), '../../../data/')
for i, file_name in enumerate(os.listdir(input_folder_path), start=1):
    with open(input_folder_path + file_name, 'r') as f:
        data = f.read()
    int_list = data.split()
    if (len(int_list) > 10):
        if (i%10 == 0):
            val_ids.extend(int_list)
            val_ids.append(0)
        else:
            train_ids.extend(int_list)
            train_ids.append(0)

print(f"train has {len(train_ids):,} tokens")
print(f"val has {len(val_ids):,} tokens")

# export to bin files
train_ids = np.array(train_ids, dtype=np.uint16)
val_ids = np.array(val_ids, dtype=np.uint16)
train_ids.tofile(os.path.join(os.path.dirname(__file__), 'train.bin'))
val_ids.tofile(os.path.join(os.path.dirname(__file__), 'val.bin'))
