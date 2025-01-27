import Car from './Car';
import Customer from './Customer';

/**
 * This class builds the Map, which includes the grid, 
 * places, car, customers and the barriers and run "bfs"
 * to find the path between every car and every customer.
 */

export default class NewMap{
    constructor(scene,mat,data){
        this.mat = mat;
        this.data = data;
        this.cars = [];
        this.customers = [];
    }


    addcars(x, y, screenX, screenY, v) {
        let car = new Car( x, y, screenX, screenY,v);
        this.cars.push(car);
    }

    addcustomers(x, y, screenX, screenY, v) {
        let customer = new Customer(x, y, screenX, screenY, v);
        this.customers.push(customer);
    }

    /**
     * This is the function which implements the BFS algorithm to
     * find the shortest path between each of the car and each of
     * the customers. 
     */

    bfs(){
        let changedmat = [];
        // -------------- 
        for(let i=0 ;i<this.mat.length; i++){
            let temp = []
            for(let j=0; j<this.mat[i].length; j++){
                temp.push([this.mat[i][j],0])
            }
            changedmat.push(temp);
        }
        // --------------
        
        for(let i=0; i<this.cars.length; i++){
            // 2 suggests there is a car
            changedmat[this.cars[i].x-1][this.cars[i].y-1] = [2,i];
        }
        for(let i=0; i<this.customers.length; i++){
            // 3 suggests there is a customer
            changedmat[this.customers[i].x-1][this.customers[i].y-1] = [3,i];
        }
        this.outputCars = []
        for(let i=0; i<this.cars.length; i++){
            let thiscarout = [];
            let visited = []
            let a = this.cars[i].x;
            let b = this.cars[i].y;
            let stack = [[a-1,b-1,0]];
            let dp = [];
            let tomove = [[1,0],[0,1],[-1,0],[0,-1]];
            for(let i=0; i<changedmat.length; i++){
                let prim = [];
                let dpfill = [];
                for(let j=0; j<changedmat[i].length; j++){
                    prim.push(false);
                    dpfill.push([-1,-1]);
                }
                visited.push(prim);
                dp.push(dpfill);
            }
            visited[a-1][b-1] = true;
            while(stack.length > 0){
                let temp = stack[0];
                stack.shift();
                for(let j=0; j<tomove.length; j++){
                    let x = temp[0]+tomove[j][0];
                    let y = temp[1]+tomove[j][1];
                    let dist = temp[2];
                    if(x>=0 && x<changedmat.length &&  y>=0 && y<changedmat[0].length){
                        if(!visited[x][y] && changedmat[x][y][0]!==0){
                            if(changedmat[x][y][0]===3){
                                //customer
                                thiscarout.push([changedmat[x][y][1],temp[2]+1]);
                                visited[x][y] = true;
                                dp[x][y] = [temp[0],temp[1]];
                                stack.push([x,y,dist+1]);
                                

                                /********************************/
                                /*Find the Customer ID*/
                                // console.log('Length: ', this.customers.length);
                                for(let k=0; k<this.customers.length; k++){
                                    // console.log(this.customers[k].x, x, this.customers[k].y,y);
                                    if(this.customers[k].x-1 === x && this.customers[k].y-1 === y){
                                        this.cars[i].customerId.push(k);
                                    }
                                }

                                /********************************/


                                /********************************/
                                /* backtracking path*/
                                let finalpath = [];
                                let px = x;
                                let py = y;
                                while(px!=-1 && py!=-1){
                                    finalpath.push([px,py])
                                    let temp1 = dp[px][py][0];
                                    let temp2 = dp[px][py][1];
                                    px = temp1;
                                    py = temp2;
                                }
                                this.cars[i].paths.push(finalpath);
                                /***********************************/


                            }else if(changedmat[x][y][0]===2 || changedmat[x][y][0]===1){
                                // car or road
                                visited[x][y] = true;
                                dp[x][y] = [temp[0],temp[1]];
                                stack.push([x,y,dist+1]);
                            }
                        }
                    }
                }
            }
            this.outputCars.push(thiscarout);
        }

    }
    

    /**
     * This function ouputs the grids, customers, cars and barriers 
     * on the screen. It also initializes instances of cars using 
     * car class and customer using customer class.
     * 
     * @param {Phaser.Scene} scene It is variable of type Phaser.Scene, which is declared in game.js
     */
    
    show(scene){
        let mat = this.mat;
        let data = this.data;
        const X = 1920;
        const Y = 1024;
        const dimX = 72; //X / mat.length;
        const dimY = 56; //Y / mat[0].length;
        scene.dimX = dimX;
        scene.dimY = dimY;
        const preX = 24; //dimX / 2;
        const preY = 64; //dimY / 2;
        scene.coordinates = []  /*stores coordinates for each matrix*/
        scene.scalefactor = 72 / 160;

        for (let i = 0; i < mat.length; i++) {
            let lst = mat[i];
            let coord_array = [];
            for (let j = 0; j < lst.length; j++) {
                //console.log(preX+i*dimX,preY+j*dimY);
                coord_array.push([preX + i * dimX, preY + j * dimY]);
                if (lst[j] === 1) {
                    scene.add.image(preX + i * dimX, preY + j * dimY, 'road').setScale(scene.scalefactor);
                } else if(lst[j] === 0) {
                    scene.add.image(preX + i * dimX, preY + j * dimY, 'wall').setScale(scene.scalefactor);
                }
                else{
                    scene.add.image(preX + i * dimX, preY + j * dimY, 'grass').setScale(scene.scalefactor);
                }
            }
            scene.coordinates.push(coord_array);
        }

        for (let i = 0; i < data["cordX"].length; i++) {
            if (data["isCar"][i] === 1) {

            //   if(data["isRed"][i]){  
            //     let v1 = scene.add.image(preX + (data["cordX"][i] - 1) * dimX, preY + (data["cordY"][i] - 1) * dimY, 'yellowCar').setInteractive();
            //     v1.setScale(scene.scalefactor);
            //     // initializing green car
            //     this.addcars(data["cordX"][i], data["cordY"][i], preX + (data["cordX"][i] - 1) * dimX , preY + (data["cordY"][i] - 1) * dimY, v1);
            //     scene.carColor.push(0); // 0 for green
            //   }else{
            //     let v1 = scene.add.image(preX + (data["cordX"][i] - 1) * dimX, preY + (data["cordY"][i] - 1) * dimY, 'yellowCar').setInteractive();
            //     v1.setScale(scene.scalefactor);
            //     // initializing yellow car
            //     this.addcars(data["cordX"][i], data["cordY"][i], preX + (data["cordX"][i] - 1) * dimX , preY + (data["cordY"][i] - 1) * dimY, v1);
            //     scene.carColor.push(1); // 1 for yellow
            //   }
            
            let idx = data["colorID"][i];
            let v1 = scene.add.image(preX + (data["cordX"][i] - 1) * dimX, preY + (data["cordY"][i] - 1) * dimY, ("car" + idx)).setInteractive();
            v1.setScale(scene.scalefactor);
            this.addcars(data["cordX"][i], data["cordY"][i], preX + (data["cordX"][i] - 1) * dimX , preY + (data["cordY"][i] - 1) * dimY, v1);
            scene.carColor.push(idx); 
            // console.log(data["WaitingTime"][i]);
            scene.carWaitingTime.push(data["WaitingTime"][i]);
            scene.carDestination.push(data["Destination"][i]);
            scene.carCoord.push([data["cordX"][i], data["cordY"][i]]);
              
            } else {
                
                // if(data["isRed"][i]){
                //     let v2 = scene.add.image(preX + (data["cordX"][i] - 1) * dimX, preY + (data ["cordY"][i] - 1) * dimY, 'redBoy').setInteractive();
                //     v2.setScale(scene.scalefactor);
                //     // red customer
                //     this.addcustomers(data["cordX"][i], data["cordY"][i], preX + (data["cordX"][i] - 1) * dimX , preY + (data["cordY"][i] - 1) * dimY, v2);
                //     scene.customerColor.push(0); // 0 for red
                // }else{
                //     let v2 = scene.add.image(preX + (data["cordX"][i] - 1) * dimX, preY + (data ["cordY"][i] - 1) * dimY, 'blueBoy').setInteractive();
                //     v2.setScale(scene.scalefactor);
                //     // blue customer
                //     this.addcustomers(data["cordX"][i], data["cordY"][i], preX + (data["cordX"][i] - 1) * dimX , preY + (data["cordY"][i] - 1) * dimY, v2);
                //     scene.customerColor.push(1); // 1 for blue
                // }
                // console.log(data["WaitingTime"][i]);

                let idx2 = data["colorID"][i];
                let v2 = scene.add.image(preX + (data["cordX"][i] - 1) * dimX, preY + (data ["cordY"][i] - 1) * dimY, ('customer' + idx2)).setInteractive();
                v2.setScale(scene.scalefactor);
                this.addcustomers(data["cordX"][i], data["cordY"][i], preX + (data["cordX"][i] - 1) * dimX , preY + (data["cordY"][i] - 1) * dimY, v2);
                scene.customerColor.push(idx2); 
                scene.customerWaitingTime.push(data["WaitingTime"][i]);
                scene.customerDestination.push(data["Destination"][i]);
                scene.customerCoord.push([data["cordX"][i], data["cordY"][i]]);
            }
        }

        this.bfs();
        for(let i=0; i < this.cars.length; i++){
            this.cars[i].drawpaths(scene);
        }

    }
}