import '../styles/BodyContainer.css';
import '../js/bodyContainer.js';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, child, get, remove } from "firebase/database";
import { createElement } from 'react';

function initSweet() {

    const MySwal = withReactContent(Swal);

    const Toast = MySwal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', MySwal.stopTimer)
          toast.addEventListener('mouseleave', MySwal.resumeTimer)
        }
      });

      return Toast;
}

function writeUserData(data) {
    const Toast = initSweet();

    window.$('#load').dimmer('show');

    try
    {
        const db = getDatabase();

        if(typeof localStorage.userSelect != 'undefined')
        {
            set(ref(db,'users/' + localStorage.userSelect), {
                name: data.name,
                email: data.email,
                status: data.status,
                date: data.date
            }).then(() => {
                /** ESTA FUNCTION COLOCA LOS CAMPOS EN BLANCO */
                setDefaultData();
                delete localStorage.userSelect;
            });
        }
        else
        {
            set(ref(db,'users/' + data.userid), {
                name: data.name,
                email: data.email,
                status: data.status,
                date: data.date
            }).then(() => {
                /** ESTA FUNCTION COLOCA LOS CAMPOS EN BLANCO */
                setDefaultData();
            });
        }

        getUsersList();

        Toast.fire({
            icon: 'success',
            title: 'Usuario '+data.name+' agregado'
        });

        let increment = parseInt(localStorage.count) + 1;
        Object.assign(localStorage,{
            count: increment
        });
    }
    catch(err)
    {   
        Toast.fire({
            icon: 'error',
            title: 'Error al guardar datos'
        });
    }
}

function getUsersList() {
    const db = getDatabase();
    const myref = ref(db);
    const Toast = initSweet();
    get(child(myref,`users`)).then((snapshot) => {
        let listContainer = document.querySelector('#collection-container');
        
        if(snapshot.exists())
        {
            let html = '';
            let snapVal = snapshot.val();
            Object.keys(snapVal).map((key,i) => {
                let st = snapVal[key];
                let stick = '<div id="'+key+'" class="ui '+(st.status != 1 && 'red')+' message set-flex">'+
                    '<div><i class="star yellow icon"></i><i class="user icon"></i></div>'+
                    '<span style="width: 15%;">'+st.name+'</span>'+
                    '<span style="width: 25%;">'+st.email+'</span>'+
                    '<span style="width: 10%;">'+st.date+'</span>'+
                    '<div style="width: 10%; text-align: center;">'+
                        (st.status != 1 ? '<b style="color: red;">inactivo</b>' : '<b style="color: green;">activo</b>')+
                    '</div>'+
                    '<div class="set-flex">'+
                        '<button class="ui mini button"><i class="pencil icon" style="margin: 0; color: dodgerblue;"></i></button>'+
                        '<button class="ui mini button"><i class="remove icon" style="margin: 0; color: red;"></i></button>'+
                    '</div>'+
                '</div>';

                html += stick;

                if((i+1) == Object.keys(snapVal).length)
                {
                    listContainer.innerHTML = html;
                    window.$('#load').dimmer('hide');

                    let list = window.$('#collection-container .message').each((i,msg) => {
                        let btns = window.$(msg).find('.button');

                        /** ACTUALIZAR */
                        window.$(btns[0]).on('click',function(e) {
                            let userid = window.$(this).parent().parent();
                                userid = window.$(userid).get(0).id;
                            openModal({
                                userid: userid,
                                userData: snapVal[userid]  
                            });

                            e.stopImmediatePropagation();
                        });
                        /** ELIMINAR */
                        window.$(btns[1]).on('click',() => {
                            remove(ref(db,'users/' + msg.id)).then(() => {
                                Toast.fire({
                                    title: 'Usuario eliminado',
                                    text: '',
                                    icon: 'success'
                                });

                                getUsersList();
                            });
                        });
                    });
                }
            });
        }
        else
        {
            listContainer.innerHTML = '<div class="ui message"><center>lo sentimos, no hay datos</center></div>';     
            window.$('#load').dimmer('hide');
        }
    }).catch((error) => {
        console.error(error);
    });
}

function setDefaultData() {
    window.$('input[name="name"]').val('');
    window.$('input[name="email"]').val('');
    window.$('#status').val(1);
}

function validateData() {
    let validate = true;
    let data = {};
    const Toast = initSweet();

    let name = window.$('input[name="name"]');
    let email = window.$('input[name="email"]');

    if(name.val().trim().length == 0)
    {
        Toast.fire({
            title: 'El campo nombre es requerido',
            text: '',
            icon: 'error'
        });
        window.$(name.parent()).addClass('error');
        validate = false;
        return false;
    }
    else 
    {
        window.$(name.parent()).removeClass('error');
        validate = true;
        data[name.get(0).name] = name.val();
    }

    if(email.val().trim().length == 0)
    {
        Toast.fire({
            title: 'El campo email es requerido',
            text: '',
            icon: 'error'
        });
        window.$(email.parent()).addClass('error');
        validate = false;
        return false;
    }
    else
    {
        window.$(email.parent()).removeClass('error');
        validate = true;
        data[email.get(0).name] = email.val();
    }

    if(validate != false)
    {
        window.$('.modal').transition('fade');

        data['userid'] = 'user' + localStorage.count;
        data['date'] = new Date().toLocaleDateString(); 
        data['status'] = window.$('#status').val();
        
        writeUserData(data);
    }
}

function openModal(data=null) {
    window.$('.modal').transition('fade',() => {
        window.$('#card-user').transition('fade');
    });

    if(data != null)
    {
        window.$('input[name="name"]').val(data.userData.name);
        window.$('input[name="email"]').val(data.userData.email);
        window.$('#status').val(data.userData.status);

        Object.assign(localStorage,{
            userSelect: data.userid
        });
    }
}

function BodyContainer() {

    // Your web app's Firebase configuration
    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
    const firebaseConfig = {
        apiKey: "AIzaSyAxAvpsJcflOicytKJaLDIEZ4-utB_ogfU",
        authDomain: "todolist-60edb.firebaseapp.com",
        databaseURL: "https://todolist-60edb-default-rtdb.firebaseio.com",
        projectId: "todolist-60edb",
        storageBucket: "todolist-60edb.appspot.com",
        messagingSenderId: "28327006130",
        appId: "1:28327006130:web:b54f3deb31d83704775eab",
        measurementId: "G-EKKCEEFX0P"
    };

    const app = initializeApp(firebaseConfig);

    setTimeout(() => {
        getUsersList();
    }, 2000);

    window.$('.dropdown').dropdown();

    if(typeof localStorage.count == 'undefined')
    {
        Object.assign(localStorage,{
            count: 0
        });
    }

    window.$(document).ready(() => {
        window.$('#btn-add').on('click',(evt) => {
            validateData();

            evt.stopImmediatePropagation();
        });
    
        window.$('#close-modal').on('click',(e) => {
            window.$('.modal').transition('fade');
            setDefaultData();

            e.stopImmediatePropagation();
        });

        window.$('#btn-new-user').on('click',() => {
            openModal();
        });
    });

    return [
        <div class="modal">
            <div class="modal-dialog">
                <div class="modal-container">
                    <div class="ui card">
                        <div class="content">
                            <i class="right floated like icon"></i>
                            <i class="right floated star icon"></i>
                            <div class="header">Agregar usuario</div>
                            <div class="description">Complete los campos obligatorios</div>
                        </div>
                        <div class="content">
                            <div class="ui fluid icon input">
                                <i class="user icon"></i>
                                <input name="name" type="text" placeholder="nombre" />
                            </div>
                            <br/>
                            <div class="ui fluid icon input">
                                <i class="envelope icon"></i>
                                <input name="email" type="email" placeholder="email" />
                            </div>
                            <br/>
                            <select id="status" name="status" class="ui fluid dropdown">
                                <option value="1">Activo</option>
                                <option value="2">Inactivo</option>
                            </select>
                        </div>
                        <div class="content">
                            <div class="set-flex">
                                <button id="close-modal" class="ui button">cancelar</button>
                                <button id="btn-add" class="ui green button">guardar</button>
                            </div>
                        </div>
                        <div class="extra content">
                            <span class="left floated like">
                            <i class="like icon"></i>
                            Like
                            </span>
                            <span class="right floated star">
                            <i class="star icon"></i>
                            Favorite
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        <div id="body-grid-container" class="ui celled grid">
            <div class="three wide column"></div>
            <div class="ten wide column">
                <div>
                    <h1>ToDo List <i class="list alternate icon"></i></h1>
                    <h3>Agrega elementos a la Lista</h3>
                    {/*  */}
                    <div class="ui horizontal divider">
                        <i class="angle down icon"></i>
                    </div>
                    {/*  */}
                    <div class="content">
                        <div class="set-flex">
                            <div class="w40 set-flex">
                                <p>Agregue o modifique los datos</p>
                            </div>
                            <div class="w15">
                                <button id="btn-new-user" class="ui blue fluid button">
                                    <i class="plus icon"></i> nuevo stick
                                </button>
                            </div>
                        </div>
                    </div>
                    <br />
                    <div id="list-container" class="content set-padding set-height-scroll">
                        <div id="collection-container"></div>
                        <div id="load" class="ui inverted dimmer">
                            <div class="ui text loader">Favor espere...</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="three wide column"></div>
        </div>
    ];
};

export default BodyContainer();