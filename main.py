import random as rd
import math

import numpy as np

#避難者クラス(Evacuees)
class Eva:
    def __init__(self, num, loc = None):
        self.num = num
        self.loc = loc if loc else -1
    def __repr__(self):
        return str([self.num, self.loc])

ks = 3.0
wid = 11
hei = 8
people_num = 7

#range(1, people_num + 1)と避難者が全単射
eva_dict = {i: Eva(i) for i in range(1, people_num + 1)}
#FF上に残る避難者のリスト(避難完了時に削除)
still = list(range(1, people_num + 1))

def two_dim_vec(num):
    if isinstance(num, int) or isinstance(num, np.int64):
        return np.array([num % wid, num // wid])
    elif isinstance(num, np.ndarray):
        return num[0] + num[1] * wid

#縦hei,横widの零行列
cell = np.zeros((hei, wid))

#出口の配置
np.put(cell, [4,5,6], -1)
exits = np.where(cell.reshape(-1,) != 0)
print(exits)
print(eva_dict)
print(still)

#空きセルにランダムに避難者を配置
eva_loc = np.random.choice(np.array(np.where(cell.reshape(-1,) == 0))
          .reshape(-1,), people_num, replace = False)
np.put(cell, eva_loc, still)
print(cell)
for i in range(1, people_num + 1):
    eva_dict[i].loc = two_dim_vec(eva_loc[i - 1])

print(eva_dict)

#2点間距離
def dist(loc1, loc2):
    loc1 = loc1 if isinstance(loc1, np.ndarray) else two_dim_vec(loc1)
    loc2 = loc2 if isinstance(loc2, np.ndarray) else two_dim_vec(loc2)
    return math.sqrt((loc1[0] - loc2[0]) ** 2 + (loc1[1] - loc2[1]) ** 2)

def eva_move(loc):
    """
    避難者クラスを移動させる関数

    Args:
        loc (int or np.int64 or np.ndarray): 避難者の位置
    """
    if isinstance(loc, int) or isinstance(loc, np.int64):
        loc = two_dim_vec(loc)

    loc_dist = min([dist(loc, i) for i in exits[0]])

    #移動先の候補
    loc_opt = []
    if loc[0] != 0:
        loc_opt.append(loc - [1, 0])
    if loc[0] != wid - 1:
        loc_opt.append(loc + [1, 0])
    if loc[1] != 0:
        loc_opt.append(loc - [0, 1])
    if loc[1] != hei - 1:
        loc_opt.append(loc + [0, 1])

    move_result = []
    for i in loc_opt:
        dist_temp = float("inf")
        for j in exits[0]:
            dist_temp = min(dist_temp, dist(i, j))
        move_result.append([i, dist_temp])
    move_chance = [[i[0], math.exp(ks * (loc_dist - i[1]))] for i in move_result]
    return move_chance

for i in still:
    print(eva_move(eva_dict[i].loc))

while False:
    #Eva毎に行動
    for i in still:
        here_loc = eva_dict[i][1]


input()