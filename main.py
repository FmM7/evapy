import random as rd
import math

import numpy as np

#避難者クラス(Evacuees)
class Eva:
    def __init__(self, num, loc = None, injured=True):
        self.num = num
        self.loc = loc if loc else -1
        self.injured = injured
    def __repr__(self):
        return str([self.num, self.loc])

ks = 2.0
wid = 100
hei = 100
people_num = 500

#range(1, people_num + 1)と避難者が全単射
eva_dict = {i: Eva(i,injured=if rd.random() < 0.9) for i in range(1, people_num + 1)}
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
np.put(cell, [wid//2], -1)
exits = np.where(cell.reshape(-1,) != 0)
#print(exits)
#print(eva_dict)
#print(still)

#空きセルにランダムに避難者を配置
eva_loc = np.random.choice(np.array(np.where(cell.reshape(-1,) == 0))
          .reshape(-1,), people_num, replace = False)
np.put(cell, eva_loc, still)
#print(cell)
for i in range(1, people_num + 1):
    eva_dict[i].loc = two_dim_vec(eva_loc[i - 1])

#print(eva_dict)

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

c = 0
res_list = []
injured_list = []
while True:
    #Eva毎に行動
    c += 1
    res_list.append([list(i) for i in cell])
    #print(still)
    escaped = []
    moved = []
    for i in still:
        if eva_dict[i].injured:
            if rd.random < 0.5:
                continue
        here_loc = eva_dict[i].loc
        move_chance = eva_move(here_loc)
        result = rd.choices([i[0] for i in move_chance], [i[1] for i in move_chance])[0]
        result_cell = cell[result[1], result[0]]
        #print(i,result,result_cell)
        if result_cell == 0:
            moved.append(eva_dict[i].loc)
            eva_dict[i].loc = result
            cell[result[1], result[0]] = i
        elif result_cell == -1:
            moved.append(eva_dict[i].loc)
            escaped.append(i)
    for i in moved:
        cell[i[1], i[0]] = 0
    for i in escaped:
        still.remove(i)
    if not still:
        #for i in res_list:
        #    print(i)
        print(c)
        break

    if not 300:
        print("osoi")
        print([list(i) for i in cell])
        exit()

path = r"C:\Users\halsa\Downloads\evapy-main\a.txt"
with open(path,mode="w") as f:
    f.writelines(map(lambda x: str(x)+"\n",res_list))

input("owaru")