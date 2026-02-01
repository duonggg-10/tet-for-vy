from flask import Flask, render_template, jsonify
import random

app = Flask(__name__)

# DANH SÁCH LỜI CHÚC & VOUCHER (Style Lầy Lội Gen Z - Update Pro Max)
wishes = [
    {"msg": "Năm 2026 rùi, bớt than Lý đi nhe cô nương! =)))", "voucher": "Quà nè: 1 buổi Dương kèm Lý (hoặc làm bài hộ kkk)"},
    {"msg": "Chúc 'Chị đẹp' năm mới bớt quạo, đừng block tui nha!", "voucher": "Quà nè: Được quyền sai vặt Dương 1 ngày"},
    {"msg": "Năm mới xinh xỉu, nhưng cấm thức khuya cày phim đó!", "voucher": "Quà nè: Ting ting 50k (lì xì lấy hên thui)"},
    {"msg": "Cảm ơn bé đã chịu đựng 'Hoàng tử bấm máy tính' này ❤️", "voucher": "Quà nè: 1 ly trà sữa full topping (Dương bao)"},
    {"msg": "Chúc Nấm lùn hay ăn chóng lớn, mà đừng giảm cân nữa!", "voucher": "Quà nè: Đi lượn phố phường với anh (anh đón)"},
    {"msg": "Năm nay ráng học giỏi khối A để còn nuôi tui nha =))", "voucher": "Quà nè: 1 cái ôm an ủi khi bị điểm kém (đùa thui)"},
    {"msg": "Tết này ăn bánh chưng ít thôi coi chừng lăn á!", "voucher": "Quà nè: Chạy bộ cùng Dương 30 phút =))"},
    {"msg": "Sáng nào cũng phải nhớ ăn sáng đầy đủ nghe chưa!", "voucher": "Quà nè: Dương mua đồ ăn sáng cho 1 tuần"},
    {"msg": "Hứa với tui là không được tăm tia anh nào khác nha!", "voucher": "Quà nè: Hôn gió 1 cái chụt chụt 😘"},
    {"msg": "Năm mới bớt 'báo' tui lại nha bà dà =)))", "voucher": "Quà nè: Được Dương tha lỗi cho 1 lần dỗi vô cớ"},
    {"msg": "Chúc bé lun vui vẻ, cười nhiều (đừng cười như điên là đc)", "voucher": "Quà nè: Ngồi nghe bé kể chuyện xàm xí 1 tiếng"},
    {"msg": "Yêu Vy nhiều hơn trà sữa lun á (xạo đó kkk)", "voucher": "Quà nè: Order ngay 1 cốc trà sữa size L"}
]

@app.route('/')
def home():
    return render_template('index.html')

import os

@app.route('/get-wish')
def get_wish():
    wish = random.choice(wishes)
    return jsonify(wish)

@app.route('/get-songs')
def get_songs():
    music_dir = os.path.join(app.static_folder, 'music')
    songs = [f for f in os.listdir(music_dir) if f.endswith('.mp3')]
    return jsonify(songs)

if __name__ == '__main__':
    app.run(debug=True)