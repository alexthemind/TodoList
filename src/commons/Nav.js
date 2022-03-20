import '../styles/Nav.css';

function Nav() {
    return (
        <div id="nav-principal" class="ui inverted big black menu">
            <div class="header item">
                Diseñando un ToDo List®
            </div>
            <a href='#' class="item">
                Faq's
            </a>
            
            <div class="right menu">
                <a href='#' class="item"><i class="bars icon"></i></a>
            </div>
        </div>
    );
}

export default Nav();