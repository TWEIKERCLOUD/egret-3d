﻿module egret3d {
    /**
    * @language zh_CN
    * @class egret3d.BoundBox
    * @classdesc
    * 可使用 Bound 类取得包围盒的数据。使用包围盒简化一个复杂模型的空间信息，执行碰撞检测和可视检测，这样可以大大提高计算效率。</p>
    * 包含包围盒的各顶点信息，当包围盒要进行世界变换时，应当变换各顶点信息。</p>
    * @see egret3d.Bound
    * @includeExample geom/BoundBox.ts
    * @version Egret 3.0
    * @platform Web,Native
    */
    export class BoundBox extends Bound {
        
        /**
        * @language zh_CN
        * 盒子最小点
        * @version Egret 3.0
        * @platform Web,Native
        */
        public min: Vector3D = new Vector3D();
                
        /**
        * @language zh_CN
        * 盒子最大点
        * @version Egret 3.0
        * @platform Web,Native
        */
        public max: Vector3D = new Vector3D();
             
        /**
        * @language zh_CN
        * 盒子宽
        * @version Egret 3.0
        * @platform Web,Native
        */
        public width: number = 0;
                                
        /**
        * @language zh_CN
        * 盒子高
        * @version Egret 3.0
        * @platform Web,Native
        */
        public heigth: number = 0;

        /**
        * @language zh_CN
        * 盒子长
        * @version Egret 3.0
        * @platform Web,Native
        */
        public depth: number = 0;

        /**
        * @language zh_CN
        * 盒子体积
        * @version Egret 3.0
        * @platform Web,Native
        */
        public volume: number = 0;
        
        /**
        * @language zh_CN
        * 盒子包围球中心点
        * @version Egret 3.0
        * @platform Web,Native
        */
        public center: Vector3D = new Vector3D();
                
        /**
        * @language zh_CN
        * 盒子包围球半径
        * @version Egret 3.0
        * @platform Web,Native
        */
        public radius: number = 0;

        private _box0: BoundBox;
        private _box1: BoundBox;

        /**
        * @language zh_CN
        * 创建一个包围
        * @param owner 绑定的Object3D对象 
        * @param min 最小点
        * @param max 最大点
        * @version Egret 3.0
        * @platform Web,Native
        */
        constructor(owner:Object3D = null, min: Vector3D = null, max: Vector3D = null) {
            super(owner);
            if (!min) {
                min = new Vector3D();
            }
            if (!max) {
                max = new Vector3D();
            }

            this.min.copyFrom(min);
            this.max.copyFrom(max);
            this.calculateBox();
        }
        
        /**
        * @language zh_CN
        * 拷贝一个包围盒
        * @param box 数据来源
        * @version Egret 3.0
        * @platform Web,Native
        */
        public copyFrom(box: BoundBox) {
            this.min.copyFrom(box.min);
            this.max.copyFrom(box.max);
            this.calculateBox();
        }
                
        /**
        * @language zh_CN
        * 填充当前包围盒
        * @param min 最小点
        * @param max 最大点
        * @version Egret 3.0
        * @platform Web,Native
        */
        public fillBox(min: Vector3D, max: Vector3D) {
            this.min.copyFrom(min);
            this.max.copyFrom(max);
            this.calculateBox();
        }
                
        /**
        * @language zh_CN
        * 检测一个点是否包围盒内
        * @param pos 检测的点
        * @returns boolean 成功返回true
        * @version Egret 3.0
        * @platform Web,Native
        */
        public pointIntersect(pos: Vector3D): boolean {
            if (pos.x <= this.max.x && pos.x >= this.min.x &&
                pos.y <= this.max.y && pos.y >= this.min.y &&
                pos.z <= this.max.z && pos.z >= this.min.z) {
                return true;
            }
            return false;
        }
                        
        /**
        * @language zh_CN
        * 检测两个包围盒是否相交
        * 功能和 intersect 一样 为版本兼容没有删除此API
        * @param box2 其中一个包围盒 
        * @param boxIntersect  默认参数为null 相交的包围盒 可以为null
        * @returns boolean 成功返回true
        * @version Egret 3.0
        * @platform Web,Native
        */
        public intersectAABBs(box2: BoundBox, boxIntersect: BoundBox = null): boolean {
            if (this.min.x > box2.max.x) {
                return false;
            }

            if (this.max.x < box2.min.x) {
                return false;
            }

            if (this.min.y > box2.max.y) {
                return false;
            }

            if (this.max.y < box2.min.y) {
                return false;
            }

            if (this.min.z > box2.max.z) {
                return false;
            }

            if (this.max.z < box2.min.z) {
                return false;
            }

            if (boxIntersect != null) {
                boxIntersect.min.x = Math.max(this.min.x, box2.min.x);
                boxIntersect.max.x = Math.min(this.max.x, box2.max.x);
                boxIntersect.min.y = Math.max(this.min.y, box2.min.y);
                boxIntersect.max.y = Math.min(this.max.y, box2.max.y);
                boxIntersect.min.z = Math.max(this.min.z, box2.min.z);
                boxIntersect.max.z = Math.min(this.max.z, box2.max.z);
                boxIntersect.calculateBox();
            }
            return true;
        }
               
        /**
        * @language zh_CN
        * 检测两个包围对象是否相交
        * 注意：target 和 intersect 必须为BoundBox对象
        * @param target 检测的目标
        * @param intersect 默认参数为null 相交的结果 可以为null
        * @returns boolean 成功返回true
        * @version Egret 3.0
        * @platform Web,Native
        */
        public intersect(target: Bound, intersect: Bound = null): boolean {
            if (!this._box0) {
                this._box0 = <BoundBox>this.clone();
            }
            else {
                this._box0.copyVertex(this);
                this._box0.owner = this.owner;
            }

            this._box0.calculateTransform();
            this._box0.updateAABB();

            if (!this._box1) {
                this._box1 = <BoundBox>target.clone();
            }
            else {
                this._box1.copyVertex(this);
                this._box1.owner = target.owner;
            }
            this._box1.calculateTransform();
            this._box1.updateAABB();

            return this._box0.intersectAABBs(this._box1, <BoundBox>intersect);
        }
                                                                
        /**
        * @language zh_CN
        * 以字符串形式返回box的值
        * @returns string 字符串
        * @version Egret 3.0
        * @platform Web,Native
        */
        public toString(): string {
            return "BoundBox [min:(" + this.min.x + ", " + this.min.y + ", " + this.min.z + ") max:(" + this.max.x + ", " + this.max.y + ", " + this.max.z + ")]";
        }
                                        
        /**
        * @language zh_CN
        * 计算包围盒数据
        * @version Egret 3.0
        * @platform Web,Native
        */
        public calculateBox() {
            
            var sub: Vector3D = this.max.subtract(this.min, MathUtil.CALCULATION_VECTOR3D_0);

            this.vexData = this.vexData || new Float32Array(24);
            this.indexData = this.indexData || new Uint16Array(36);

            this.vexData[0] = this.min.x;
            this.vexData[1] = this.min.y;
            this.vexData[2] = this.min.z;

            this.vexData[3] = this.min.x;
            this.vexData[4] = this.min.y;
            this.vexData[5] = this.min.z + sub.z;

            this.vexData[6] = this.min.x + sub.x;
            this.vexData[7] = this.min.y;
            this.vexData[8] = this.min.z + sub.z;

            this.vexData[9] = this.min.x + sub.x;
            this.vexData[10] = this.min.y;
            this.vexData[11] = this.min.z;

            this.vexData[12] = this.max.x - sub.x;
            this.vexData[13] = this.max.y;
            this.vexData[14] = this.max.z - sub.z;


            this.vexData[15] = this.max.x - sub.x;
            this.vexData[16] = this.max.y;
            this.vexData[17] = this.max.z;

            this.vexData[18] = this.max.x;
            this.vexData[19] = this.max.y;
            this.vexData[20] = this.max.z;

            this.vexData[21] = this.max.x;
            this.vexData[22] = this.max.y;
            this.vexData[23] = this.max.z - sub.z;

            this.indexData[0] = 0;
            this.indexData[1] = 4;
            this.indexData[2] = 7;
            this.indexData[3] = 0;
            this.indexData[4] = 7;
            this.indexData[5] = 3;

            this.indexData[6] = 2;
            this.indexData[7] = 6;
            this.indexData[8] = 5;
            this.indexData[9] = 2;
            this.indexData[10] = 5;
            this.indexData[11] = 1;

            this.indexData[12] = 4;
            this.indexData[13] = 5;
            this.indexData[14] = 6;
            this.indexData[15] = 4;
            this.indexData[16] = 6;
            this.indexData[17] = 7;

            this.indexData[18] = 0;
            this.indexData[19] = 3;
            this.indexData[20] = 2;
            this.indexData[21] = 0;
            this.indexData[22] = 2;
            this.indexData[23] = 1;

            this.indexData[24] = 0;
            this.indexData[25] = 1;
            this.indexData[26] = 5;
            this.indexData[27] = 0;
            this.indexData[28] = 5;
            this.indexData[29] = 4;

            this.indexData[30] = 3;
            this.indexData[31] = 7;
            this.indexData[32] = 6;
            this.indexData[33] = 3;
            this.indexData[34] = 6;
            this.indexData[35] = 2;

            this.width = this.max.x - this.min.x;
            this.heigth = this.max.y - this.min.y;
            this.depth = this.max.z - this.min.z;
            this.volume = this.width * this.heigth * this.depth;

            var c: Vector3D = this.max.subtract(this.min, MathUtil.CALCULATION_VECTOR3D_1);
            c.scaleBy(0.5);

            this.radius = c.length;
            this.center.copyFrom(this.min);
            var tmp: Vector3D = this.center.add(c, MathUtil.CALCULATION_VECTOR3D_2);
            this.center.copyFrom(tmp);

            for (var i: number = 0; i < 8; ++i) {
                this._bound.geometry.setVerticesForIndex(i, VertexFormat.VF_POSITION, [this.vexData[i * 3 + 0], this.vexData[i * 3 + 1], this.vexData[i * 3 + 2]], 1);
            }
        }

        /**
        * @language zh_CN
        * 检测一个盒子是否在视椎体内
        * @param frustum 视椎体
        * @returns boolean 在视椎内返回ture
        * @version Egret 3.0
        * @platform Web,Native
        */
        public inBound(frustum: Frustum): boolean {
            
            this.transform.transformVector(this.center, MathUtil.CALCULATION_VECTOR3D);
            return frustum.inSphere(MathUtil.CALCULATION_VECTOR3D, this.radius);
        }

        protected updateAABB() {
            this.min.copyFrom(new Vector3D(MathUtil.MAX_VALUE, MathUtil.MAX_VALUE, MathUtil.MAX_VALUE));
            this.max.copyFrom(new Vector3D(-MathUtil.MAX_VALUE, -MathUtil.MAX_VALUE, -MathUtil.MAX_VALUE));
            for (var i: number = 0; i < this.vexData.length; i += this.vexLength) {
                if (this.max.x < this.vexData[i]) {
                    this.max.x = this.vexData[i];
                }
                if (this.max.y < this.vexData[i + 1]) {
                    this.max.y = this.vexData[i + 1];
                }
                if (this.max.z < this.vexData[i + 2]) {
                    this.max.z = this.vexData[i + 2];
                }
               
                if (this.min.x > this.vexData[i]) {
                    this.min.x = this.vexData[i];
                }
                if (this.min.y > this.vexData[i + 1]) {
                    this.min.y = this.vexData[i + 1];
                }
                if (this.min.z > this.vexData[i + 2]) {
                    this.min.z = this.vexData[i + 2];
                }
            }
        }


        /**
        * @private
        */
        public createChild() {
            this.childBound = new BoundBox(this.owner);
            var max: Vector3D = new Vector3D();
            var min: Vector3D = new Vector3D();

            max.x = this.center.x + this.width / 4;
            max.y = this.center.y + this.heigth / 4;
            max.z = this.center.z + this.depth / 4;

            min.x = this.center.x - this.width / 4;
            min.y = this.center.y - this.heigth / 4;
            min.z = this.center.z - this.depth / 4;

            (<BoundBox>this.childBound).fillBox(min, max);
        }

        /**
        * @language zh_CN
        * 克隆一個包圍對象
        * @returns Bound 包圍對象
        */
        public clone(): Bound {
            var bound: BoundBox = new BoundBox(this.owner, this.min, this.max);
            return bound;
        }
    }
}