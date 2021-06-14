import random as rd

import numpy as np

#避難者クラス(Evacuees)
class Eva:
    def __init__(self,ear):
        self.ear = ear

    def __repr__(self):
        return f"Eva({self.ear})"

wid = 11
hei = 8
people_num = 7
eva_dict = {i: [Eva(rd.randint(1,10))] for i in range(1, people_num + 1)}
still = list(range(1, people_num + 1))

def two_dim_vec(num):
    if isinstance(num, int) or isinstance(num, np.int64):
        return np.array([num % wid, num // wid])
    elif isinstance(num, np.ndarray):
        return num[0] + num[1] * wid

cell = np.zeros((hei, wid))

#Exits
np.put(cell, [4,5,6,-6], -1)
exits = np.where(cell.reshape(-1,) != 0)
print(exits)
print(eva_dict)
print(still)

eva_loc = np.random.choice(np.array(np.where(cell.reshape(-1,) == 0)).reshape(-1,), people_num, replace = False)
np.put(cell, eva_loc, still)
print(cell)
for i in range(1, people_num + 1):
    eva_dict[i].append(two_dim_vec(eva_loc[i - 1]))

print(eva_dict)

