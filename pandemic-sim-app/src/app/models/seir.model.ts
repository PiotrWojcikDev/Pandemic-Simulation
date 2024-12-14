export interface SEIRModel {
    susceptible: number; 
    exposed: number;     
    infectious: number;  
    recovered: number;   
}

export interface SEIRParameters {
    beta: number;  
    sigma: number; 
    gamma: number; 
}