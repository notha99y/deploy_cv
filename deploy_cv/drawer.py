from PIL import Image, ImageDraw, ImageFont
import seaborn as sns
import numpy as np
import random
class Drawer:
    '''Class that draws bbox'''

    random.seed(99)

    color_palette = np.array(np.array(sns.color_palette('hls', 8)) * 255, dtype=np.uint8)
    font = ImageFont.load_default()

    def __init__(self):
        pass

    @classmethod    
    def draw_bb(cls, image, ltrb, label):
        '''ltrb: tuple of left top right bottom a.k.a x1y1x2y2
        '''
        l,t,r,b = ltrb
        color = tuple(cls.color_palette[random.randint(0,len(cls.color_palette) - 1)])
        font_color = (0,0,0)
        font_size = cls.font.getsize(label)
        image_draw = ImageDraw.Draw(image)
        image_draw.rectangle([(l,t), (r,b)], width=2, outline=color)
        image_draw.rectangle([(l,t), (l + font_size[0], t + font_size[1])], fill=color)
        image_draw.text((l,t), label, font = cls.font, fill=font_color)

    @classmethod
    def convert_cxcywh_to_ltrb(cls, cxcywh):
        '''cxcywh: tuple of center x, center y, width height
        '''
        x_c, y_c, w, h = cxcywh
        l = x_c - 0.5 * w
        r = x_c + 0.5 * w
        t = y_c - 0.5 * h
        b = y_c + 0.5 * h
        return (l,t,r,b)

if __name__ == "__main__":
    img = Image.open('/home/notha99y/Desktop/test/cat.jpg')
    ltrb = (0,0,50,50)
    Drawer.draw_bb(img, ltrb, 'test')
    img.show()