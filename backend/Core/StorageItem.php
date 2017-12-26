<?php

/**
 * Created by PhpStorm.
 * User: clovis
 * Date: 15/02/17
 * Time: 15:08
 */
abstract class StorageItem
{
    public $id;

    private $state;
    protected $storage;


    public function __construct($storage, $id = NULL)
    {
        if($id != NULL)
        {
            $this->id = $id;
        }
        $this->state = StorageState::UpToDate;
        $this->storage = $storage;
    }

    public function setStorage($storage)
    {
        $this->storage = $storage;
    }

    public function Id()
    {
        return $this->id;
    }

    public function unload(&$value)
    {
        $value = array(Null);
    }

    protected function isLoaded($value)
    {
        if(isset($value) && $value[0] == NULL)
        {
            return false;
        }
        return true;
    }

    public function setState($state)
    {
        //print "Changing state: ".$this->state." -> ".$state."<br>";
        $this->state = $state;
    }

    public function State()
    {
        return $this->state;
    }

    protected function setChanged()
    {
        if($this->state == StorageState::UpToDate)
            $this->state = StorageState::ToUpdate;
    }

    protected function checkIntegrity($property)
    {
        $class_name = get_class($this);
        $anos = new ReflectionAnnotatedProperty($class_name, $property);
        $anos = $anos->getAllAnnotations();
        foreach ($anos as $ano)
        {
            if($ano instanceof ICoreAnnotation)
                $ano->validate($this->$property);
        }
    }

    public function checkIntegrityAll()
    {
        $clas = new ReflectionClass(get_class($this));
        foreach ($clas->getProperties() as $property)
        {
            $this->checkIntegrity($property->getName());
        }
    }


}